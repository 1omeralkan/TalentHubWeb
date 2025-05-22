const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  uploadMedia,
  getUserUploads,
  deleteUpload,
  toggleLike,
  getLikesCount,
  isPostLikedByUser,
  getLikers,
  toggleDislike,
  getDislikesCount,
  isPostDislikedByUser,
  getDislikers,
  getFollowingUploads,
} = require("../controllers/uploadController");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

// Multer ayarları
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({ storage });

// 📤 Dosya Yükleme
router.post("/upload", verifyToken, upload.single("media"), uploadMedia);

// 📂 Kullanıcının yüklediği yetenekleri listeleme
router.get("/my-uploads", verifyToken, getUserUploads);
router.delete("/uploads/:id", verifyToken, deleteUpload);

// Beğeni işlemleri
router.post("/uploads/:id/like", verifyToken, toggleLike);
router.get("/uploads/:id/likes", getLikesCount);
router.get("/uploads/:id/isLiked", verifyToken, isPostLikedByUser);
router.get("/uploads/:id/likers", getLikers);

// Dislike işlemleri
router.post("/uploads/:id/dislike", verifyToken, toggleDislike);
router.get("/uploads/:id/dislikes", getDislikesCount);
router.get("/uploads/:id/isDisliked", verifyToken, isPostDislikedByUser);
router.get("/uploads/:id/dislikers", getDislikers);

// Takip edilenlerin gönderileri
router.get("/uploads/following", verifyToken, getFollowingUploads);

module.exports = router;
