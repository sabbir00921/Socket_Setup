const express = require("express");
const router = express.Router();
const authController = require("../../controller/auth.controller");
const { authGuard } = require("../../middleware/auth.middleware");
const { upload } = require("../../middleware/multer.middleware");

router.route("/registration").post(authController.register);
router.route("/login").post(authController.login);
router.route("/logout").post(authGuard, authController.logout);
router.route("/get-profile").get(authGuard, authController.getProfile);

module.exports = router;
