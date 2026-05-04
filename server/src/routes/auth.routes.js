const express = require("express");
const { signup, login, logout, getMe } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { signupRules, loginRules } = require("../validators/auth.validator");

const router = express.Router();

router.post("/signup", signupRules, validate, signup);
router.post("/login", loginRules, validate, login);
router.post("/logout", logout);
router.get("/me", protect, getMe);

module.exports = router;
