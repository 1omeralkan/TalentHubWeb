const express = require('express');
const router = express.Router();
const { sendMessage, getUserMessages, getRecentChats } = require('../controllers/messageController');
const verifyToken = require('../middleware/verifyToken');

// Tüm route'lar için verifyToken middleware'ini kullan
router.use(verifyToken);

// Mesaj gönderme
router.post('/send', sendMessage);

// Belirli bir kullanıcı ile olan mesajları getirme
router.get('/with/:otherUserId', getUserMessages);

// Son mesajlaşılan kişileri getirme
router.get('/recent', getRecentChats);

module.exports = router; 