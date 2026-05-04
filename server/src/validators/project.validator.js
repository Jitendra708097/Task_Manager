const { body, param } = require("express-validator");
const mongoose = require("mongoose");

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const projectIdRule = [
  param("projectId").custom(isObjectId).withMessage("Valid project id is required"),
];

const createProjectRules = [
  body("name")
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Project name must be 3-100 characters"),
  body("description")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),
  body("members").optional().isArray().withMessage("Members must be an array of user ids"),
  body("members.*").optional().custom(isObjectId).withMessage("Every member id must be valid"),
];

const updateProjectRules = [
  ...projectIdRule,
  body("name")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Project name must be 3-100 characters"),
  body("description")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),
  body("members").optional().isArray().withMessage("Members must be an array of user ids"),
  body("members.*").optional().custom(isObjectId).withMessage("Every member id must be valid"),
];

module.exports = { projectIdRule, createProjectRules, updateProjectRules };
