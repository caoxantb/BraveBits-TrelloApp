const express = require("express");
const mongoose = require("mongoose");
require("express-async-errors");
const cors = require("cors");

const app = express();

//routers
const boardsRouter = require("./controllers/boards");
const listsRouter = require("./controllers/lists");
const tasksRouter = require("./controllers/tasks");

//middlewares
const config = require("./utils/config");
const middleware = require("./utils/middleware");

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((er) => {
    console.error("error connecting to MongoDB", er.message);
  });

app.use(cors());
app.use(express.json());
app.use(middleware.requestLogger);

app.use("/api/boards", boardsRouter);
app.use("/api/lists", listsRouter);
app.use("/api/tasks", tasksRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
