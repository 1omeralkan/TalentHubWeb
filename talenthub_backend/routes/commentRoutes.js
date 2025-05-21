const express = require('express');
const router = express.Router();
const { createComment, getCommentsByUpload, deleteComment, updateComment, getCommenters } = require('../controllers/commentController');
const verifyToken = require('../middleware/verifyToken');

// Yorum ekle
router.post('/', verifyToken, createComment);
// Bir videonun tüm yorumlarını getir
router.get('/:uploadId', getCommentsByUpload);
// Bir videoya yorum yapan kullanıcıları getir
router.get('/:uploadId/commenters', getCommenters);
// Yorumu sil
router.delete('/:id', verifyToken, deleteComment);
// Yorumu düzenle
router.put('/:id', verifyToken, updateComment);

module.exports = router; 