const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");

router.get("/dashboard", verifyToken, (req, res) => {
  const { fullName, userName, email } = req.user;

  res.json({
    message: `TalentHub'a Hoş Geldin ${fullName}`,
    user: { fullName, userName, email },
  });
});

module.exports = router;
