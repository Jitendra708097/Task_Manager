const Project = require("../models/project.model");
const Task = require("../models/task.model");
const asyncHandler = require("../utils/asyncHandler");

const getDashboard = asyncHandler(async (req, res) => {
  const projectIds = await Project.find(
    req.user.role === "Admin" ? {} : { members: req.user._id }
  ).distinct("_id");

  const baseQuery = { project: { $in: projectIds } };
  const now = new Date();

  const [totalTasks, todo, inProgress, done, overdue, myTasks, projects] = await Promise.all([
    Task.countDocuments(baseQuery),
    Task.countDocuments({ ...baseQuery, status: "Todo" }),
    Task.countDocuments({ ...baseQuery, status: "In Progress" }),
    Task.countDocuments({ ...baseQuery, status: "Done" }),
    Task.countDocuments({ ...baseQuery, status: { $ne: "Done" }, dueDate: { $lt: now } }),
    Task.find({ ...baseQuery, assignedTo: req.user._id })
      .populate("project", "name")
      .sort({ dueDate: 1 })
      .limit(8),
    Project.countDocuments(req.user.role === "Admin" ? {} : { members: req.user._id }),
  ]);

  res.json({
    summary: { projects, totalTasks, todo, inProgress, done, overdue },
    myTasks,
  });
});

module.exports = { getDashboard };
