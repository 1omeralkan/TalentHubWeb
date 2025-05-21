const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { toggleDislike, getDislikeCount, isDislikedByUser } = require('../controllers/commentDislikeController');

// Yorum beğenmeme veya geri alma
router.post('/:commentId', verifyToken, toggleDislike);
// Yorumun toplam dislike sayısı
router.get('/:commentId/count', getDislikeCount);
// Kullanıcı bu yorumu dislike etmiş mi?
router.get('/:commentId/is-disliked', verifyToken, isDislikedByUser);

module.exports = router; 