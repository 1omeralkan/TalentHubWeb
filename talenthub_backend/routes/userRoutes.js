const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const verifyToken = require('../middleware/verifyToken');

router.use(verifyToken);

// Kullanıcıyı id ile getir
router.get('/:userId', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.userId) },
      select: {
        id: true,
        userName: true,
        fullName: true,
        profilePhotoUrl: true,
        isOnline: true,
        lastSeen: true,
      }
    });
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Kullanıcı getirilemedi' });
  }
});

module.exports = router; 