const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const axios = require('axios');

// 📤 Medya yükleme
const uploadMedia = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Dosya yüklenemedi" });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  // caption alanı gelmezse boş string olarak kaydet
  const caption = req.body.caption || "";

  try {
    const upload = await prisma.upload.create({
      data: {
        mediaUrl: fileUrl,
        caption: caption,
        userId: req.user.userId,
      },
    });

    const analysis = await analyzeVideoWithPython(`./${fileUrl}`);
    if (analysis) {
      await prisma.upload.update({
        where: { id: upload.id },
        data: { analysis },
      });
    }

    res.status(200).json({
      message: "Dosya başarıyla yüklendi!",
      fileUrl,
      caption,
    });
  } catch (err) {
    console.error("Yükleme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// 📥 Kullanıcının yüklediği içerikleri listeleme
const getUserUploads = async (req, res) => {
  try {
    const uploads = await prisma.upload.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ uploads });
  } catch (err) {
    console.error("Listeleme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

const deleteUpload = async (req, res) => {
  const { id } = req.params;
  try {
    // Kendi yüklediği dosya mı kontrolü (güvenlik için)
    const upload = await prisma.upload.findUnique({ where: { id: Number(id) } });
    if (!upload || upload.userId !== req.user.userId) {
      return res.status(403).json({ message: "Yetkiniz yok!" });
    }
    await prisma.upload.delete({ where: { id: Number(id) } });
    res.status(200).json({ message: "Yetenek silindi" });
  } catch (err) {
    console.error("Silme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

async function analyzeVideoWithPython(videoPath) {
  try {
    const res = await axios.post('http://localhost:5001/analyze', { video_path: videoPath });
    return res.data;
  } catch (err) {
    console.error('Video analiz hatası:', err.message);
    return null;
  }
}

// Bir postu beğen veya beğenmekten vazgeç (toggle)
const toggleLike = async (req, res) => {
  const uploadId = Number(req.params.id);
  const userId = req.user.userId;
  try {
    // Kullanıcı bu postu zaten beğenmiş mi?
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_uploadId: {
          userId,
          uploadId,
        },
      },
    });

    // Eğer dislike varsa kaldır
    const existingDislike = await prisma.dislike.findUnique({
      where: {
        userId_uploadId: {
          userId,
          uploadId,
        },
      },
    });
    if (existingDislike) {
      await prisma.dislike.delete({ where: { id: existingDislike.id } });
    }

    if (existingLike) {
      // Beğeniyi kaldır (unlike)
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
      return res.status(200).json({ liked: false, disliked: false });
    } else {
      // Beğeni ekle
      await prisma.like.create({
        data: {
          userId,
          uploadId,
        },
      });
      return res.status(200).json({ liked: true, disliked: false });
    }
  } catch (err) {
    console.error("Beğeni hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Bir postun toplam beğeni sayısını getir
const getLikesCount = async (req, res) => {
  const uploadId = Number(req.params.id);
  try {
    const count = await prisma.like.count({
      where: { uploadId },
    });
    res.status(200).json({ count });
  } catch (err) {
    console.error("Beğeni sayısı hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Bir kullanıcı bu postu beğenmiş mi?
const isPostLikedByUser = async (req, res) => {
  const uploadId = Number(req.params.id);
  const userId = Number(req.query.userId) || req.user?.userId;
  if (!userId) return res.status(400).json({ message: "Kullanıcı ID gerekli" });
  try {
    const like = await prisma.like.findUnique({
      where: {
        userId_uploadId: {
          userId,
          uploadId,
        },
      },
    });
    res.status(200).json({ liked: !!like });
  } catch (err) {
    console.error("Beğeni kontrol hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Bir gönderiyi beğenen kullanıcıların listesini getir
const getLikers = async (req, res) => {
  const uploadId = Number(req.params.id);
  try {
    const likers = await prisma.like.findMany({
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
    res.status(200).json({
      users: likers.map(like => like.user)
    });
  } catch (err) {
    console.error("Beğenenler listesi hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Bir postu dislike et veya dislike'dan vazgeç (toggle)
const toggleDislike = async (req, res) => {
  const uploadId = Number(req.params.id);
  const userId = req.user.userId;
  try {
    // Kullanıcı bu postu zaten dislike etmiş mi?
    const existingDislike = await prisma.dislike.findUnique({
      where: {
        userId_uploadId: {
          userId,
          uploadId,
        },
      },
    });
    if (existingDislike) {
      // Dislike'ı kaldır
      await prisma.dislike.delete({ where: { id: existingDislike.id } });
      return res.status(200).json({ disliked: false });
    } else {
      // Eğer like varsa önce onu kaldır
      const existingLike = await prisma.like.findUnique({
        where: {
          userId_uploadId: {
            userId,
            uploadId,
          },
        },
      });
      if (existingLike) {
        await prisma.like.delete({ where: { id: existingLike.id } });
      }
      // Dislike ekle
      await prisma.dislike.create({
        data: { userId, uploadId },
      });
      return res.status(200).json({ disliked: true });
    }
  } catch (err) {
    console.error("Dislike hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Bir postun toplam dislike sayısını getir
const getDislikesCount = async (req, res) => {
  const uploadId = Number(req.params.id);
  try {
    const count = await prisma.dislike.count({ where: { uploadId } });
    res.status(200).json({ count });
  } catch (err) {
    console.error("Dislike sayısı hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Bir kullanıcı bu postu dislike etmiş mi?
const isPostDislikedByUser = async (req, res) => {
  const uploadId = Number(req.params.id);
  const userId = Number(req.query.userId) || req.user?.userId;
  if (!userId) return res.status(400).json({ message: "Kullanıcı ID gerekli" });
  try {
    const dislike = await prisma.dislike.findUnique({
      where: {
        userId_uploadId: {
          userId,
          uploadId,
        },
      },
    });
    res.status(200).json({ disliked: !!dislike });
  } catch (err) {
    console.error("Dislike kontrol hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Bir gönderiyi dislike eden kullanıcıların listesini getir
const getDislikers = async (req, res) => {
  const uploadId = Number(req.params.id);
  try {
    const dislikers = await prisma.dislike.findMany({
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
    res.status(200).json({
      users: dislikers.map(dislike => dislike.user)
    });
  } catch (err) {
    console.error("Beğenmeyenler listesi hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Takip edilen kullanıcıların gönderilerini getir
const getFollowingUploads = async (req, res) => {
  const userId = req.user.userId;
  try {
    // Takip edilen kullanıcıların ID'lerini bul
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true }
    });
    const followingIds = following.map(f => f.followingId);
    if (followingIds.length === 0) return res.json([]);

    // Takip edilenlerin uploadlarını çek
    const uploads = await prisma.upload.findMany({
      where: { userId: { in: followingIds } },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, userName: true, fullName: true, profilePhotoUrl: true } },
        likes: true,
        dislikes: true,
        comments: true
      }
    });
    // Like/dislike/comment sayıları ile birlikte dön
    const result = uploads.map(u => ({
      id: u.id,
      mediaUrl: u.mediaUrl,
      caption: u.caption,
      createdAt: u.createdAt,
      user: u.user,
      likeCount: u.likes.length,
      dislikeCount: u.dislikes.length,
      commentCount: u.comments.length
    }));
    res.json(result);
  } catch (err) {
    console.error("Takip edilenlerin gönderileri hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

module.exports = {
  uploadMedia,
  getUserUploads,
  deleteUpload,
  toggleLike,
  getLikesCount,
  isPostLikedByUser,
  getLikers,
  toggleDislike,
  getDislikesCount,
  isPostDislikedByUser,
  getDislikers,
  getFollowingUploads,
};