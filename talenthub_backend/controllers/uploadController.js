const uploadMedia = (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "Dosya yüklenemedi" });
    }
  
    // Yüklenen dosya bilgileri
    const fileUrl = `/uploads/${req.file.filename}`;
    const caption = req.body.caption;
  
    res.status(200).json({
      message: "Dosya başarıyla yüklendi!",
      fileUrl,
      caption,
    });
  };
  
  module.exports = { uploadMedia };
  