const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getFollowStatus
} = require('../controllers/followController');

// Takip et
router.post('/:userId', verifyToken, followUser);

// Takibi bırak
router.delete('/:userId', verifyToken, unfollowUser);

// Takipçileri listele
router.get('/followers/:userId', verifyToken, getFollowers);

// Takip edilenleri listele
router.get('/following/:userId', verifyToken, getFollowing);

// Takip durumunu kontrol et
router.get('/status/:userId', verifyToken, getFollowStatus);

module.exports = router; 