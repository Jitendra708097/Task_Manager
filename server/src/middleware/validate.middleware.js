const { validationResult } = require("express-validator");
const ApiError = require("../utils/ApiError");

const validate = (req, res, next) => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  const error = new ApiError(400, "Validation failed");
  error.errors = result.array().map((item) => ({
    field: item.path,
    message: item.msg,
  }));
  next(error);
};

module.exports = validate;
