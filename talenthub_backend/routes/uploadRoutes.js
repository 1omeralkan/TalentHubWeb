const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  uploadMedia,
  getUserUploads,
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

module.exports = router;
