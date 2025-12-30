const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    isGroup: {
      type: Boolean,
      default: false,
    },

    name: {
      type: String,
      trim: true,
    },

    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Chat || mongoose.model("Chat", chatSchema);

