const mongoose = require("mongoose");

const listSchema = new mongoose.Schema({
  name: String,
  tasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
  ],
});

module.exports = mongoose.model("List", listSchema);
