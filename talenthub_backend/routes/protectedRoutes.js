const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");

router.get("/dashboard", verifyToken, (req, res) => {
  const { fullName, userName, email } = req.user;

  res.json({
    message: `Merhaba ${fullName} (@${userName}), dashboard'a hoş geldin!`,
    user: { fullName, userName, email },
  });
});

module.exports = router;
