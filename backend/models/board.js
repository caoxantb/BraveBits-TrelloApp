const mongoose = require("mongoose");

const boardSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: "todoboard",
  },
  lists: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "List",
    },
  ],
});

module.exports = mongoose.model("Board", boardSchema);
