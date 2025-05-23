const express = require('express');
const router = express.Router();
const { createPersonalChat, getMyChats } = require('../controllers/chatController');
const verifyToken = require('../middleware/verifyToken');

router.use(verifyToken);

// Kişisel sohbet oluştur
router.post('/create', createPersonalChat);

// Kullanıcının dahil olduğu sohbetleri getir
router.get('/my', getMyChats);

module.exports = router; 