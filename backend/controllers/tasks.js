const tasksRouter = require("express").Router();

const List = require("../models/list");
const Task = require("../models/task");

tasksRouter.post("/:listID", async (req, res) => {
  const listID = req.params.listID;
  const body = req.body;

  const list = await List.findById(listID);

  const task = await Task.create(body);
  list.tasks = list.tasks.concat(task._id);
  await list.save();

  res.status(201).json(task);
});

tasksRouter.get("/:listID/:id", async (req, res) => {
  const task = await Task.findById(req.params.id);
  res.json(task);
});

tasksRouter.put("/:listID/:id", async (req, res) => {
  const taskID = req.params.id;
  const body = req.body;

  const newTask = {
    checked: body.checked,
  };

  const updatedTask = await Task.findByIdAndUpdate(taskID, newTask);
  res.json(updatedTask);
});

tasksRouter.delete("/:listID/:id", async (req, res) => {
  const listID = req.params.listID;
  const taskID = req.params.id;

  const list = await List.findById(listID);

  list.tasks = list.tasks.filter((t) => t.toString() !== taskID);
  await list.save();

  await Task.findByIdAndRemove(taskID);
  res.status(204).end();
});

module.exports = tasksRouter;
