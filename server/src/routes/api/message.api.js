const express = require("express");
const router = express.Router();
const messageController = require("../../controller/message.controller");
const { authGuard } = require("../../middleware/auth.middleware");
const { upload } = require("../../middleware/multer.middleware");

router.route("/send-message").post(authGuard, messageController.sendMessage);
router
  .route("/get-messages/:chatId")
  .get(authGuard, messageController.getMessages);
router
  .route("/markas-read/:messageId")
  .post(authGuard, messageController.markAsRead);
router
  .route("/update-message/:messageId")
  .patch(authGuard, messageController.updateMessage);
router
  .route("/delete-message/:messageId")
  .delete(authGuard, messageController.deleteMessage);

module.exports = router;
