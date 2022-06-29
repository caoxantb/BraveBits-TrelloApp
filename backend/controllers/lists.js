const listsRouter = require("express").Router();

const mongoose = require("mongoose");
const Board = require("../models/board");
const List = require("../models/list");

console.log("----->", mongoose.Types.ObjectId("62b29570cdad9e2653e1ddc0"));

listsRouter.post("/:boardID/", async (req, res) => {
  const boardID = req.params.boardID;
  const body = req.body;

  const board = await Board.findById(boardID);

  const list = await List.create(body);

  board.lists = board.lists.concat(list._id);
  await board.save();

  res.status(201).json(list);
});

listsRouter.get("/:boardID/:id", async (req, res) => {
  const list = await List.findById(req.params.id).populate("tasks");
  res.json(list);
});

listsRouter.put("/:boardID/:id", async (req, res) => {
  const listID = req.params.id;
  const body = req.body;

  console.log(">>>", req.body);

  const tasks = body.tasks.map((t) => mongoose.Types.ObjectId(t));

  console.log(tasks);

  const newList = {
    tasks: tasks,
  };

  const updatedList = await List.findByIdAndUpdate(listID, newList);
  res.json(updatedList);
});

listsRouter.delete("/:boardID/:id", async (req, res) => {
  const boardID = req.params.boardID;
  const listID = req.params.id;

  const board = await Board.findById(boardID);
  board.lists = board.lists.filter((l) => l.toString() !== listID);
  await board.save();

  await List.findByIdAndRemove(listID);
  res.status(204).end();
});

module.exports = listsRouter;
