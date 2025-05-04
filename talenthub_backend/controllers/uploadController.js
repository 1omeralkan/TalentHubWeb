const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// 📤 Medya yükleme
const uploadMedia = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Dosya yüklenemedi" });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  const caption = req.body.caption;

  try {
    await prisma.upload.create({
      data: {
        mediaUrl: fileUrl,
        caption: caption,
        userId: req.user.userId,
      },
    });

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

module.exports = {
  uploadMedia,
  getUserUploads,
};
