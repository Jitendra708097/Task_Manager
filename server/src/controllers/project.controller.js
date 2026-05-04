const Project = require("../models/project.model");
const Task = require("../models/task.model");
const User = require("../models/user.model");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const projectQueryForUser = (user) =>
  user.role === "Admin" ? {} : { members: user._id };

const listProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find(projectQueryForUser(req.user))
    .populate("owner", "name email role")
    .populate("members", "name email role")
    .sort({ createdAt: -1 });

  res.json({ projects });
});

const createProject = asyncHandler(async (req, res) => {
  const { name, description, members = [] } = req.body;
  const memberIds = [...new Set([req.user._id.toString(), ...members])];
  const existingMembers = await User.find({ _id: { $in: memberIds } }).select("_id");

  if (existingMembers.length !== memberIds.length) {
    throw new ApiError(400, "One or more members do not exist");
  }

  const project = await Project.create({
    name,
    description,
    owner: req.user._id,
    members: memberIds,
  });

  const populatedProject = await project.populate([
    { path: "owner", select: "name email role" },
    { path: "members", select: "name email role" },
  ]);

  res.status(201).json({ project: populatedProject });
});

const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findOne({
    _id: req.params.projectId,
    ...projectQueryForUser(req.user),
  })
    .populate("owner", "name email role")
    .populate("members", "name email role");

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const tasks = await Task.find({ project: project._id })
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role")
    .sort({ dueDate: 1 });

  res.json({ project, tasks });
});

const updateProject = asyncHandler(async (req, res) => {
  const { name, description, members } = req.body;
  const update = {};

  if (name !== undefined) update.name = name;
  if (description !== undefined) update.description = description;
  if (members !== undefined) {
    const memberIds = [...new Set([req.user._id.toString(), ...members])];
    const existingMembers = await User.find({ _id: { $in: memberIds } }).select("_id");

    if (existingMembers.length !== memberIds.length) {
      throw new ApiError(400, "One or more members do not exist");
    }

    update.members = memberIds;
  }

  const project = await Project.findByIdAndUpdate(req.params.projectId, update, {
    new: true,
    runValidators: true,
  })
    .populate("owner", "name email role")
    .populate("members", "name email role");

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  res.json({ project });
});

const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  await Task.deleteMany({ project: project._id });
  res.json({ message: "Project and related tasks deleted" });
});

const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("name email role").sort({ name: 1 });
  res.json({ users });
});

module.exports = {
  listProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  listUsers,
};
