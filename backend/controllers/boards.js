const boardsRouter = require("express").Router();

const mongoose = require("mongoose");
const Board = require("../models/board");
const Task = require("../models/task");

boardsRouter.get("/:id", async (req, res) => {
  const boardID = req.params.id;
  const board = await Board.findById(boardID).populate("lists");
  console.log(board.lists[0]);
  res.json(board);
});

//HARD CODE ID, POST ONLY ONE
// boardsRouter.post("/", async (req, res) => {
//   const body = req.body;

//   const board = Board.create(body);
//   res.status(201).json(board);
// });

boardsRouter.put("/:id", async (req, res) => {
  const boardID = req.params.id;
  const body = req.body;

  const lists = body.lists.map((l) => mongoose.Types.ObjectId(l._id));

  const newBoard = {
    lists: lists,
  };

  console.log(newBoard);

  const updatedBoard = await Board.findByIdAndUpdate(boardID, newBoard);
  res.json(updatedBoard);
});

module.exports = boardsRouter;
