const { asyncHandaler } = require("../utils/asyncHandaler");
const { apiResponse } = require("../utils/apiResponse");
const { CustomError } = require("../helpers/customError");
const userModel = require("../model/user.model");

/* REGISTER */
exports.register = asyncHandaler(async (req, res) => {
  const { name, email, password } = req.body;

  const exists = await userModel.findOne({ email });
  if (exists) throw new CustomError(400, "User already exists");

  const user = await userModel.create({ name, email, password });

  apiResponse.sendSucess(res, 201, "Registration successful", {
    _id: user._id,
    name: user.name,
    email: user.email,
  });
});

/* LOGIN */
exports.login = asyncHandaler(async (req, res) => {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email });
  if (!user) throw new CustomError(400, "Invalid credentials");

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new CustomError(400, "Invalid credentials");

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();

  // save accesstoken in cookie
  res.cookie("AccessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 1 * 60 * 60 * 1000,
  });
  apiResponse.sendSucess(res, 200, "Login successful", {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
    accessToken,
  });
});

/* LOGOUT */
exports.logout = asyncHandaler(async (req, res) => {
  const id = req.user._id;
  if (!id) throw new CustomError(400, "Invalid token");

  const user = await userModel.findOne({ _id: id });
  if (!user) throw new CustomError(400, "Invalid token");

  user.refreshToken = null;
  await user.save();
  //remove refresh token from database
  user.refreshToken = null;

  // remove accesstoken from cookie
  res.clearCookie("AccessToken");

  apiResponse.sendSucess(res, 200, "Logout successful");
});

/* get-profile*/
exports.getProfile = asyncHandaler(async (req, res) => {
  const user = await userModel
    .findById(req.user._id)
    .select("-password -refreshToken");
  if (!user) throw new CustomError(404, "User not found");

  apiResponse.sendSucess(res, 200, "Profile fetched", user);
});
