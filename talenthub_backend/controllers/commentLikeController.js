const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Yorum beğen veya beğenmekten vazgeç (toggle)
const toggleLike = async (req, res) => {
  const commentId = Number(req.params.commentId);
  const userId = req.user.userId;
  try {
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    });
    if (existingLike) {
      await prisma.commentLike.delete({ where: { id: existingLike.id } });
      return res.status(200).json({ liked: false });
    } else {
      await prisma.commentLike.create({
        data: { userId, commentId },
      });
      return res.status(200).json({ liked: true });
    }
  } catch (err) {
    console.error("Yorum beğeni hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Yorumun toplam beğeni sayısı
const getLikeCount = async (req, res) => {
  const commentId = Number(req.params.commentId);
  try {
    const count = await prisma.commentLike.count({ where: { commentId } });
    res.status(200).json({ count });
  } catch (err) {
    console.error("Yorum beğeni sayısı hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Kullanıcı bu yorumu beğenmiş mi?
const isLikedByUser = async (req, res) => {
  const commentId = Number(req.params.commentId);
  const userId = Number(req.query.userId) || req.user?.userId;
  if (!userId) return res.status(400).json({ message: "Kullanıcı ID gerekli" });
  try {
    const like = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    });
    res.status(200).json({ liked: !!like });
  } catch (err) {
    console.error("Yorum beğeni kontrol hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

module.exports = {
  toggleLike,
  getLikeCount,
  isLikedByUser,
}; 