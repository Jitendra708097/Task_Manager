const { body, param, query } = require("express-validator");
const mongoose = require("mongoose");

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value);
const statuses = ["Todo", "In Progress", "Done"];
const priorities = ["Low", "Medium", "High"];

const taskIdRule = [
  param("taskId").custom(isObjectId).withMessage("Valid task id is required"),
];

const listTaskRules = [
  query("status").optional().isIn(statuses).withMessage("Invalid status filter"),
  query("project").optional().custom(isObjectId).withMessage("Valid project id is required"),
];

const createTaskRules = [
  body("title").trim().isLength({ min: 3, max: 120 }).withMessage("Title must be 3-120 characters"),
  body("description")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1200 })
    .withMessage("Description cannot exceed 1200 characters"),
  body("project").custom(isObjectId).withMessage("Valid project id is required"),
  body("assignedTo").custom(isObjectId).withMessage("Valid assignee id is required"),
  body("status").optional().isIn(statuses).withMessage("Invalid status"),
  body("priority").optional().isIn(priorities).withMessage("Invalid priority"),
  body("dueDate").isISO8601().toDate().withMessage("Valid due date is required"),
];

const updateTaskRules = [
  ...taskIdRule,
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 120 })
    .withMessage("Title must be 3-120 characters"),
  body("description")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1200 })
    .withMessage("Description cannot exceed 1200 characters"),
  body("assignedTo").optional().custom(isObjectId).withMessage("Valid assignee id is required"),
  body("status").optional().isIn(statuses).withMessage("Invalid status"),
  body("priority").optional().isIn(priorities).withMessage("Invalid priority"),
  body("dueDate").optional().isISO8601().toDate().withMessage("Valid due date is required"),
];

module.exports = { taskIdRule, createTaskRules, updateTaskRules, listTaskRules };
