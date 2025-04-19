const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const protectedRoutes = require("./routes/protectedRoutes");
const uploadRoutes = require("./routes/uploadRoutes"); // ⬅️ upload route'u eklendi

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

app.get("/", (req, res) => {
  res.send("TalentHub Backend Çalışıyor!");
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
