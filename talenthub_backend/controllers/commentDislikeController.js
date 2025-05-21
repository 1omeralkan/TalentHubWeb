const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Yorum beğenmeme veya beğenmemekten vazgeç (toggle)
const toggleDislike = async (req, res) => {
  const commentId = Number(req.params.commentId);
  const userId = req.user.userId;
  try {
    const existingDislike = await prisma.commentDislike.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    });

    // Like kontrolü
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    });

    // Eğer like varsa kaldır
    if (existingLike) {
      await prisma.commentLike.delete({ where: { id: existingLike.id } });
    }

    if (existingDislike) {
      await prisma.commentDislike.delete({ where: { id: existingDislike.id } });
      return res.status(200).json({ disliked: false, liked: false });
    } else {
      await prisma.commentDislike.create({
        data: { userId, commentId },
      });
      return res.status(200).json({ disliked: true, liked: false });
    }
  } catch (err) {
    console.error("Yorum dislike hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Yorumun toplam dislike sayısı
const getDislikeCount = async (req, res) => {
  const commentId = Number(req.params.commentId);
  try {
    const count = await prisma.commentDislike.count({ where: { commentId } });
    res.status(200).json({ count });
  } catch (err) {
    console.error("Yorum dislike sayısı hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Kullanıcı bu yorumu dislike etmiş mi?
const isDislikedByUser = async (req, res) => {
  const commentId = Number(req.params.commentId);
  const userId = Number(req.query.userId) || req.user?.userId;
  if (!userId) return res.status(400).json({ message: "Kullanıcı ID gerekli" });
  try {
    const dislike = await prisma.commentDislike.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    });
    res.status(200).json({ disliked: !!dislike });
  } catch (err) {
    console.error("Yorum dislike kontrol hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

module.exports = {
  toggleDislike,
  getDislikeCount,
  isDislikedByUser,
}; 