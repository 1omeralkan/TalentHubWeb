const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Keşfet algoritması: Son eklenen 10 içeriği getir
router.get('/', async (req, res) => {
  try {
    const uploads = await prisma.upload.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: true // Eğer kullanıcı bilgisi de göstermek istersen
      }
    });
    res.json(uploads);
  } catch (err) {
    res.status(500).json({ error: 'Bir hata oluştu.' });
  }
});

module.exports = router;
