const express = require("express");
const router = express.Router();
const chatController = require("../../controller/chat.controller");
const { authGuard } = require("../../middleware/auth.middleware");
const { upload } = require("../../middleware/multer.middleware");

router.route("/access-chat").post(authGuard, chatController.accessChat);
router.route("/get-chats").get(authGuard, chatController.getChats);

module.exports = router;
