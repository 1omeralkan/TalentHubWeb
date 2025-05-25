const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const protectedRoutes = require("./routes/protectedRoutes");
const uploadRoutes = require("./routes/uploadRoutes"); // ⬅️ upload route'u eklendi
const exploreRoutes = require("./routes/explore"); // ⬅️ explore route'u eklendi
const profileRoutes = require('./routes/profileRoutes');
const followRoutes = require('./routes/followRoutes');
const commentRoutes = require('./routes/commentRoutes');
const commentLikeRoutes = require('./routes/commentLikeRoutes');
const commentDislikeRoutes = require('./routes/commentDislikeRoutes'); // Yeni route eklendi
const messageRoutes = require('./routes/messageRoutes');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Statik klasör: uploads klasöründeki dosyaları tarayıcıdan erişilebilir yap
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Route'lar
app.use("/api", authRoutes);
app.use("/api", protectedRoutes);
app.use("/api", uploadRoutes); // ⬅️ yeni route eklendi
app.use("/api/explore", exploreRoutes); // ⬅️ explore route'u eklendi
app.use('/api', profileRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/comment-likes', commentLikeRoutes);
app.use('/api/comment-dislikes', commentDislikeRoutes); // Yeni route eklendi
app.use('/api/messages', messageRoutes);
app.get("/", (req, res) => {
  res.send("TalentHub Backend Çalışıyor!");
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
