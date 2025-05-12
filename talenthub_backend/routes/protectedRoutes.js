const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const { getMe, editProfile } = require("../controllers/authController");

router.get("/dashboard", verifyToken, (req, res) => {
  const { fullName, userName, email } = req.user;

  res.json({
    message: `TalentHub'a Hoş Geldin ${fullName}`,
    user: { fullName, userName, email },
  });
});

router.get("/me", verifyToken, getMe);
router.post("/edit-profile", verifyToken, editProfile);

module.exports = router;
