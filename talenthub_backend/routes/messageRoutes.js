const express = require('express');
const router = express.Router();
const { sendMessage, getUserMessages, getRecentChats, deleteMessageForMe, deleteMessageForAll, deleteChatForMe } = require('../controllers/messageController');
const verifyToken = require('../middleware/verifyToken');

// Tüm route'lar için verifyToken middleware'ini kullan
router.use(verifyToken);

// Mesaj gönderme
router.post('/send', sendMessage);

// Belirli bir kullanıcı ile olan mesajları getirme
router.get('/with/:otherUserId', getUserMessages);

// Son mesajlaşılan kişileri getirme
router.get('/recent', getRecentChats);

// Mesajı sadece kendinden sil (Benden Sil)
router.delete('/messages/:messageId/forme', deleteMessageForMe);

// Mesajı herkesten sil (Herkesten Sil)
router.delete('/messages/:messageId/forall', deleteMessageForAll);

// Sohbeti sadece kendinden sil (Benden Sil)
router.delete('/chats/:chatId/forme', deleteChatForMe);

module.exports = router; 