const { asyncHandaler } = require("../utils/asyncHandaler");
const { apiResponse } = require("../utils/apiResponse");
const { CustomError } = require("../helpers/customError");
const { getIo } = require("../socket/server");
const messageModel = require("../model/message.model");
const chatModel = require("../model/chat.model");

/* SEND MESSAGE */
exports.sendMessage = asyncHandaler(async (req, res) => {
  const { chatId, text } = req.body;
  if (!chatId || !text) {
    throw new CustomError(400, "ChatId and text required");
  }

  const message = await messageModel.create({
    chat: chatId,
    sender: req.user._id,
    text,
  });
  // console.log(chatId, text, message);

  console.log(chatId);
  await chatModel.findByIdAndUpdate(chatId, {
    lastMessage: message._id,
  });

  const populatedMessage = await messageModel
    .findById(message._id)
    .populate("sender", "name avatar")
    .populate({
      path: "chat",
      populate: {
        path: "users",
        select: "name avatar",
      },
    });

  // ✅ SOCKET EMIT (FIXED)
  const io = getIo();
  io.to(chatId).emit("newMessage", populatedMessage);

  apiResponse.sendSucess(res, 201, "Message sent", populatedMessage);
});

/* GET MESSAGES */
exports.getMessages = asyncHandaler(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user._id;

  if (!chatId) {
    throw new CustomError(400, "ChatId is required");
  }

  // Check chat exists
  const chat = await chatModel.findById(chatId);

  if (!chat) {
    throw new CustomError(404, "Chat not found");
  }

  //  Check user is part of the chat
  const isMember = chat.users.some((id) => id.toString() === userId.toString());

  if (!isMember) {
    throw new CustomError(403, "You are not allowed to view these messages");
  }

  //  Fetch messages
  const messages = await messageModel
    .find({ chat: chatId })
    .populate("sender", "name avatar")
    .sort({ createdAt: 1 });

  apiResponse.sendSucess(res, 200, "Messages fetched", messages);
});

/* MARK AS READ */
exports.markAsRead = asyncHandaler(async (req, res) => {
  const { messageId } = req.params;

  // also check if user is part of the chat
  const message = await messageModel
    .findById(messageId)
    .populate("sender", "name avatar")
    .populate({
      path: "chat",
      populate: {
        path: "users",
        select: "name avatar",
      },
    });

  if (!message) {
    throw new CustomError(404, "Message not found");
  }

  // check user
  const isMember = message.chat.users.some(
    (user) => user._id.toString() === req.user._id.toString()
  );
  if (!isMember) {
    throw new CustomError(
      403,
      "You are not allowed to mark this message as read"
    );
  }

  //check sender can't mark as read
  if (message.sender._id.toString() === req.user._id.toString()) {
    throw new CustomError(403, "You can't mark your own message as read");
  }

  // check if message is already read
  if (message.readBy.includes(req.user._id)) {
    throw new CustomError(400, "Message already marked as read");
  }

  const updatedMessage = await messageModel
    .findByIdAndUpdate(
      messageId,
      {
        $addToSet: { readBy: req.user._id },
      },
      { new: true }
    )
    .populate("sender", "name avatar")
    .populate({
      path: "chat",
      populate: {
        path: "users",
        select: "name avatar",
      },
    })
    .populate("readBy", "name avatar");

  // 🔔 SOCKET EMIT
  const io = getIo();
  io.to(message.chat._id.toString()).emit("messageRead", {
    chatId: message.chat._id,
    text: updatedMessage.text,
    readBy: {
      _id: req.user._id,
      name: req.user.name,
      avatar: req.user.avatar,
    },
  });

  apiResponse.sendSucess(res, 200, "Message marked as read", updatedMessage);
});

//update message
exports.updateMessage = asyncHandaler(async (req, res) => {
  const { messageId } = req.params;
  const { text } = req.body;

  const message = await messageModel.findById(messageId);
  if (!message) {
    throw new CustomError(404, "Message not found");
  }

  //only sender can update message
  if (message.sender._id.toString() !== req.user._id.toString()) {
    throw new CustomError(403, "Only sender can update message");
  }

  const updatedMessage = await messageModel.findByIdAndUpdate(
    messageId,
    { text },
    { new: true }
  );
  apiResponse.sendSucess(res, 200, "Message updated", updatedMessage);
});

// TODO: DELETE MESSAGE
exports.deleteMessage = asyncHandaler(async (req, res) => {
  const { messageId } = req.params;

  const message = await messageModel.findById(messageId);
  if (!message) {
    throw new CustomError(404, "Message not found");
  }

  const isMember = message.chat.users.some(
    (user) => user._id.toString() === req.user._id.toString()
  );
  if (!isMember) {
    throw new CustomError(403, "You are not allowed to delete this message");
  }

  await messageModel.findByIdAndDelete(messageId);
  apiResponse.sendSucess(res, 200, "Message deleted successfully", message);
});
