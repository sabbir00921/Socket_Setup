const express = require("express");
const router = express.Router();

router.use("/auth", require("./api/auth.api"));
router.use("/chat", require("./api/chat.api"));
router.use("/message", require("./api/message.api"));


module.exports = router;
