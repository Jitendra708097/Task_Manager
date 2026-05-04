const express = require("express");
const { listProjects, createProject, getProject, updateProject, deleteProject, listUsers } = require("../controllers/project.controller");
const { protect, authorize } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { projectIdRule, createProjectRules, updateProjectRules } = require("../validators/project.validator");

const router = express.Router();

router.use(protect);

router.get("/users", authorize("Admin"), listUsers);
router.get("/", listProjects);
router.post("/", authorize("Admin"), createProjectRules, validate, createProject);
router.get("/:projectId", projectIdRule, validate, getProject);
router.patch("/:projectId", authorize("Admin"), updateProjectRules, validate, updateProject);
router.delete("/:projectId", authorize("Admin"), projectIdRule, validate, deleteProject);

module.exports = router;
