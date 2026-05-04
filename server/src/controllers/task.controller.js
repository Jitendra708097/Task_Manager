const Project = require("../models/project.model");
const Task = require("../models/task.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const ensureProjectAccess = async (projectId, user) => {
  const query = user.role === "Admin" ? { _id: projectId } : { _id: projectId, members: user._id };
  const project = await Project.findOne(query);

  if (!project) {
    throw new ApiError(404, "Project not found or inaccessible");
  }

  return project;
};

const listTasks = asyncHandler(async (req, res) => {
  const projectIds = await Project.find(
    req.user.role === "Admin" ? {} : { members: req.user._id }
  ).distinct("_id");

  const query = { project: { $in: projectIds } };
  if (req.query.status) query.status = req.query.status;
  if (req.query.project) query.project = req.query.project;

  const tasks = await Task.find(query)
    .populate("project", "name")
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role")
    .sort({ dueDate: 1, createdAt: -1 });

  res.json({ tasks });
});

const createTask = asyncHandler(async (req, res) => {
  const { title, description, project, assignedTo, status, priority, dueDate } = req.body;
  const projectDoc = await ensureProjectAccess(project, req.user);

  if (!projectDoc.members.map(String).includes(assignedTo)) {
    throw new ApiError(400, "Assigned user must be a project member");
  }

  const task = await Task.create({
    title,
    description,
    project,
    assignedTo,
    status,
    priority,
    dueDate,
    createdBy: req.user._id,
  });

  const populatedTask = await task.populate([
    { path: "project", select: "name" },
    { path: "assignedTo", select: "name email role" },
    { path: "createdBy", select: "name email role" },
  ]);

  res.status(201).json({ task: populatedTask });
});

const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.taskId);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  await ensureProjectAccess(task.project, req.user);

  const canEditAllFields = req.user.role === "Admin" || task.createdBy.equals(req.user._id);
  const allowedMemberFields = ["status"];
  const updates = Object.keys(req.body);

  if (!canEditAllFields && updates.some((field) => !allowedMemberFields.includes(field))) {
    throw new ApiError(403, "Members can only update task status");
  }

  const fields = canEditAllFields
    ? ["title", "description", "assignedTo", "status", "priority", "dueDate"]
    : allowedMemberFields;

  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      task[field] = req.body[field];
    }
  });

  if (req.body.assignedTo) {
    const projectDoc = await Project.findById(task.project);
    if (!projectDoc.members.map(String).includes(req.body.assignedTo)) {
      throw new ApiError(400, "Assigned user must be a project member");
    }
  }

  await task.save();
  const populatedTask = await task.populate([
    { path: "project", select: "name" },
    { path: "assignedTo", select: "name email role" },
    { path: "createdBy", select: "name email role" },
  ]);

  res.json({ task: populatedTask });
});

const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.taskId);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  await ensureProjectAccess(task.project, req.user);

  if (req.user.role !== "Admin" && !task.createdBy.equals(req.user._id)) {
    throw new ApiError(403, "Only admins or task creators can delete tasks");
  }

  await task.deleteOne();
  res.json({ message: "Task deleted" });
});

module.exports = { listTasks, createTask, updateTask, deleteTask };
