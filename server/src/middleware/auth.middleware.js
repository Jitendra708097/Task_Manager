const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { getRedis } = require("../config/redis");

const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    throw new ApiError(401, "Authentication required");
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch {
    throw new ApiError(401, "Invalid or expired token");
  }

  const redis = getRedis();
  if (redis && payload.tokenId) {
    const blacklisted = await redis.get(`blacklist:${payload.tokenId}`);
    if (blacklisted) {
      throw new ApiError(401, "Token is no longer active");
    }
  }

  const user = await User.findById(payload.id);
  if (!user) {
    throw new ApiError(401, "User no longer exists");
  }

  req.user = user;
  req.tokenPayload = payload;
  next();
});

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, "You do not have permission for this action"));
  }
  next();
};

module.exports = { protect, authorize };
