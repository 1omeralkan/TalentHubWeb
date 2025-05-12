const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const verifyToken = require('../middleware/verifyToken');

// Multer ayarları
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage });

// Profil fotoğrafı yükle/güncelle
router.post('/profile-photo', verifyToken, upload.single('media'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Dosya yüklenemedi' });

  const fileUrl = `/uploads/${req.file.filename}`;
  try {
    // Eski fotoğrafı bul ve sil
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (user && user.profilePhotoUrl) {
      const oldPath = `./uploads${user.profilePhotoUrl.replace('/uploads', '')}`;
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    // Kullanıcıya yeni fotoğrafı kaydet
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { profilePhotoUrl: fileUrl }
    });
    res.status(200).json({ message: 'Profil fotoğrafı güncellendi!', fileUrl });
  } catch (err) {
    console.error('Profil fotoğrafı güncelleme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Profil fotoğrafı sil
router.delete('/profile-photo', verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user || !user.profilePhotoUrl) {
      return res.status(404).json({ message: 'Profil fotoğrafı yok.' });
    }
    const filePath = `./uploads${user.profilePhotoUrl.replace('/uploads', '')}`;
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { profilePhotoUrl: null }
    });
    res.status(200).json({ message: 'Profil fotoğrafı silindi.' });
  } catch (err) {
    console.error('Profil fotoğrafı silme hatası:', err);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Kullanıcı bilgisi dönen endpoint
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        fullName: true,
        userName: true,
        email: true,
        bio: true,
        profilePhotoUrl: true // <-- Burası önemli!
      }
    });
    // profilePhotoUrl null ise boş string dön
    if (user) {
      user.profilePhotoUrl = user.profilePhotoUrl || "";
    }
    console.log("Kullanıcı bilgisi:", user);
    res.status(200).json(user); // Sadece user objesini döndür
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Kullanıcı arama endpoint'i
router.get('/search/users', async (req, res) => {
  const q = req.query.q || '';
  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { userName: { contains: q, mode: 'insensitive' } },
          { fullName: { contains: q, mode: 'insensitive' } }
        ]
      },
      select: { id: true, userName: true, fullName: true, profilePhotoUrl: true }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Arama sırasında hata oluştu.' });
  }
});

// Başka bir kullanıcının profilini getir
router.get('/user/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        userName: true,
        bio: true,
        profilePhotoUrl: true
      }
    });
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Başka bir kullanıcının yüklediği yetenekler
router.get('/user/:userId/uploads', async (req, res) => {
  const userId = parseInt(req.params.userId);
  try {
    const uploads = await prisma.upload.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ uploads });
  } catch (err) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;