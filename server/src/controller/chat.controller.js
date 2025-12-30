const { asyncHandaler } = require("../utils/asyncHandaler");
const { apiResponse } = require("../utils/apiResponse");
const { CustomError } = require("../helpers/customError");
const chatModel = require("../model/chat.model");

/* CREATE OR GET 1-1 CHAT */
exports.accessChat = asyncHandaler(async (req, res) => {
  const id = req.user._id;
  const { userId } = req.body;

  if (!userId) throw new CustomError(400, "User id required");

  let isChat = await chatModel
    .find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
    .populate("users", "name email avatar")
    .populate("lastMessage");

  isChat = await isChat[0];

  const fullChat = !isChat
    ? await chatModel.create({
        users: [id, userId],
      })
    : isChat;

  apiResponse.sendSucess(res, 201, "Chat created", fullChat);
});

/* GET ALL CHATS */
exports.getChats = asyncHandaler(async (req, res) => {
  const chats = await chatModel.find({
    users: req.user._id,
  })
    .populate("users", "name email avatar")
    .populate("lastMessage")
    .sort({ updatedAt: -1 });

  apiResponse.sendSucess(res, 200, "Chats fetched", chats);
});
