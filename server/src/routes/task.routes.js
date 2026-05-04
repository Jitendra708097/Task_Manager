const express = require("express");
const {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
} = require("../controllers/task.controller");
const { protect } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const {
  taskIdRule,
  createTaskRules,
  updateTaskRules,
  listTaskRules,
} = require("../validators/task.validator");

const router = express.Router();

router.use(protect);

router.get("/", listTaskRules, validate, listTasks);
router.post("/", createTaskRules, validate, createTask);
router.patch("/:taskId", updateTaskRules, validate, updateTask);
router.delete("/:taskId", taskIdRule, validate, deleteTask);

module.exports = router;
