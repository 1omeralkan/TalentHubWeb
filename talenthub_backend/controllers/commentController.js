const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Yorum ekle
const createComment = async (req, res) => {
  const { uploadId, content, parentId } = req.body;
  if (!content || !uploadId) {
    return res.status(400).json({ message: "Yorum ve video ID gerekli" });
  }
  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        uploadId: Number(uploadId),
        userId: req.user.userId,
        parentId: parentId ? Number(parentId) : null,
      },
      include: {
        user: { select: { id: true, userName: true, fullName: true, profilePhotoUrl: true } },
      },
    });
    res.status(201).json(comment);
  } catch (err) {
    console.error("Yorum ekleme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Bir videonun tüm yorumlarını getir (en yeni üstte, alt yorumlar dahil)
const getCommentsByUpload = async (req, res) => {
  const uploadId = Number(req.params.uploadId);
  try {
    // Recursive olarak yanıtları getiren yardımcı fonksiyon
    const getReplies = async (parentId) => {
      const replies = await prisma.comment.findMany({
        where: { parentId },
        orderBy: { createdAt: "asc" },
        include: {
          user: { select: { id: true, userName: true, fullName: true, profilePhotoUrl: true } },
        },
      });

      // Her yanıt için recursive olarak alt yanıtları getir
      const repliesWithNestedReplies = await Promise.all(
        replies.map(async (reply) => {
          const nestedReplies = await getReplies(reply.id);
          return {
            ...reply,
            userId: reply.userId, // userId'yi ekle
            user: reply.user,     // user objesini de ekle
            replies: nestedReplies,
          };
        })
      );

      return repliesWithNestedReplies;
    };

    // Ana yorumları getir
    const comments = await prisma.comment.findMany({
      where: { uploadId, parentId: null },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, userName: true, fullName: true, profilePhotoUrl: true } },
        // userId alanını da ekle
      },
    });

    // Her ana yorum için recursive olarak tüm yanıtları getir
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await getReplies(comment.id);
        return {
          ...comment,
          userId: comment.userId, // userId'yi ekle
          user: comment.user,     // user objesini de ekle
          replies,
        };
      })
    );

    res.status(200).json(commentsWithReplies);
  } catch (err) {
    console.error("Yorumları getirme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Yorumu sil (kullanıcı kendi yorumunu veya video sahibi herhangi bir yorumu silebilir)
const deleteComment = async (req, res) => {
  const commentId = Number(req.params.id);
  try {
    // Yorumu ve ilişkili upload bilgisini getir
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        upload: {
          select: {
            userId: true // Video sahibinin ID'sini al
          }
        }
      }
    });

    if (!comment) {
      return res.status(404).json({ message: "Yorum bulunamadı" });
    }

    // Yetki kontrolü: Kullanıcı yorumun sahibi mi veya video sahibi mi?
    const isCommentOwner = comment.userId === req.user.userId;
    const isVideoOwner = comment.upload.userId === req.user.userId;

    if (!isCommentOwner && !isVideoOwner) {
      return res.status(403).json({ 
        message: "Bu yorumu silmeye yetkiniz yok. Sadece kendi yorumlarınızı veya videonuzdaki yorumları silebilirsiniz." 
      });
    }

    // Yorumu ve ilişkili tüm yanıtları recursive olarak sil
    const deleteCommentAndReplies = async (commentId) => {
      // Önce bu yoruma ait tüm yanıtları bul
      const replies = await prisma.comment.findMany({
        where: { parentId: commentId }
      });

      // Her yanıt için recursive olarak silme işlemini uygula
      for (const reply of replies) {
        await deleteCommentAndReplies(reply.id);
      }

      // Yorumun beğenilerini sil
      await prisma.commentLike.deleteMany({
        where: { commentId }
      });

      // Yorumu sil
      await prisma.comment.delete({
        where: { id: commentId }
      });
    };

    await deleteCommentAndReplies(commentId);
    res.status(200).json({ message: "Yorum ve tüm yanıtları başarıyla silindi" });
  } catch (err) {
    console.error("Yorum silme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Yorumu düzenle (sadece yorum sahibi düzenleyebilir)
const updateComment = async (req, res) => {
  const commentId = Number(req.params.id);
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ message: "Yorum içeriği boş olamaz" });
  }

  try {
    // Yorumu ve sahibini kontrol et
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        user: {
          select: { id: true }
        }
      }
    });

    if (!comment) {
      return res.status(404).json({ message: "Yorum bulunamadı" });
    }

    // Yetki kontrolü: Sadece yorum sahibi düzenleyebilir
    if (comment.user.id !== req.user.userId) {
      return res.status(403).json({ message: "Bu yorumu düzenlemeye yetkiniz yok" });
    }

    // Yorumu güncelle
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content: content.trim() },
      include: {
        user: { select: { id: true, userName: true, fullName: true, profilePhotoUrl: true } }
      }
    });

    res.status(200).json(updatedComment);
  } catch (err) {
    console.error("Yorum düzenleme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Bir videoya yorum yapan benzersiz kullanıcıları getir
const getCommenters = async (req, res) => {
  const uploadId = Number(req.params.uploadId);
  try {
    // Tüm yorumları getir (ana yorumlar ve yanıtlar dahil)
    const comments = await prisma.comment.findMany({
      where: { uploadId },
      include: {
        user: {
          select: {
            id: true,
            userName: true,
            fullName: true,
            profilePhotoUrl: true,
          },
        },
      },
    });

    // Benzersiz kullanıcıları bul (userId'ye göre)
    const uniqueUsers = Array.from(
      new Map(comments.map(comment => [comment.user.id, comment.user])).values()
    );

    res.status(200).json({ users: uniqueUsers });
  } catch (err) {
    console.error("Yorum yapanlar listesi hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

module.exports = {
  createComment,
  getCommentsByUpload,
  deleteComment,
  updateComment,
  getCommenters,
}; 