const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/user.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { getRedis } = require("../config/redis");

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const signToken = (user) => {
  const tokenId = crypto.randomUUID();
  const token = jwt.sign(
    { id: user._id, role: user.role, tokenId },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "7d" }
  );
  return token;
};

const setTokenCookie = (res, user) => {
  const token = signToken(user);
  res.cookie("token", token, cookieOptions);
  return token;
};

const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "Email is already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password: hashedPassword, role: "Member" });
  setTokenCookie(res, user);

  res.status(201).json({ user: publicUser(user) });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  setTokenCookie(res, user);
  res.json({ user: publicUser(user) });
});

const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.token;

  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const redis = getRedis();
      if (redis && payload.tokenId && payload.exp) {
        const secondsUntilExpiry = Math.max(payload.exp - Math.floor(Date.now() / 1000), 1);
        await redis.set(`blacklist:${payload.tokenId}`, "1", { EX: secondsUntilExpiry });
      }
    } catch {
      // Expired or invalid tokens can be cleared without a Redis write.
    }
  }

  res.clearCookie("token", cookieOptions);
  res.json({ message: "Logged out successfully" });
});

const getMe = asyncHandler(async (req, res) => {
  res.json({ user: publicUser(req.user) });
});

module.exports = { signup, login, logout, getMe };
