const express = require('express');
const router = express.Router();
const { toggleLike, getLikeCount, isLikedByUser } = require('../controllers/commentLikeController');
const verifyToken = require('../middleware/verifyToken');

// Yorum beğen veya beğenmekten vazgeç (toggle)
router.post('/:commentId', verifyToken, toggleLike);
// Yorumun toplam beğeni sayısı
router.get('/:commentId/count', getLikeCount);
// Kullanıcı bu yorumu beğenmiş mi?
router.get('/:commentId/is-liked', verifyToken, isLikedByUser);

module.exports = router; 