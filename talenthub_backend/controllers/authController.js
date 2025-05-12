const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const { sendResetPasswordEmail } = require("../utils/mailService");

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

// ✅ KAYIT
const registerUser = async (req, res) => {
  const { fullName, userName, email, password } = req.body;

  try {
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) return res.status(400).json({ message: "Bu e-posta zaten kayıtlı" });

    const existingUserName = await prisma.user.findFirst({ where: { userName } });
    if (existingUserName) return res.status(400).json({ message: "Bu kullanıcı adı zaten alınmış" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        fullName,
        userName,
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      message: "Kullanıcı oluşturuldu",
      userId: newUser.id,
    });
  } catch (err) {
    console.error("Kayıt Hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// ✅ GİRİŞ
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: "Kullanıcı bulunamadı" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Şifre yanlış" });

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        userName: user.userName,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Giriş başarılı",
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        userName: user.userName,
      },
    });
  } catch (err) {
    console.error("Giriş Hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// ✅ ŞİFREMİ UNUTTUM
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: "Bu e-posta sistemde kayıtlı değil" });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "15m" });

    await sendResetPasswordEmail(email, token);

    res.status(200).json({ message: "Şifre sıfırlama e-postası gönderildi." });
  } catch (err) {
    console.error("Şifre sıfırlama hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// ✅ PROFİL GETİR
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { fullName: true, userName: true, email: true, bio: true },
    });
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// ✅ PROFİL DÜZENLE
const editProfile = async (req, res) => {
  const { fullName, userName } = req.body;
  try {
    // Kullanıcı adı başka biri tarafından alınmış mı kontrolü
    const existing = await prisma.user.findFirst({
      where: {
        userName,
        id: { not: req.user.userId },
      },
    });
    if (existing) return res.status(400).json({ message: "Bu kullanıcı adı zaten alınmış" });
    const updated = await prisma.user.update({
      where: { id: req.user.userId },
      data: { fullName, userName },
    });
    res.json({ message: "Profil güncellendi", user: { fullName: updated.fullName, userName: updated.userName } });
  } catch (err) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  getMe,
  editProfile,
};
