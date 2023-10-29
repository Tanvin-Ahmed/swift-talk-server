const { generateAuthToken } = require("../helper/auth/generateAuthToken");
const { userModel } = require("../models/user");
const {
  findUserByEmail,
  findUserByEmailAndUpdate,
  createNewUser,
} = require("../service/user");
const { filterObj } = require("../utils/filterObj");

const register = async (req, res, next) => {
  try {
    const data = req.body;

    // check if verified user with given email exists
    const existingUser = await findUserByEmail(data.email);
    if (existingUser && existingUser.verified) {
      return res
        .status(400)
        .json({ status: "Error", message: "User already exists" });
    } else if (existingUser) {
      const requiredData = filterObj(
        req.body,
        "firstName",
        "lastName",
        "password"
      );
      const updatedUser = await findUserByEmailAndUpdate(
        data.email,
        requiredData
      );
      // generate OTP and send to the user email address
      req.userId = updatedUser._id;
      next();
    } else {
      // if user record is not found in database
      const requiredData = filterObj(
        req.body,
        "firstName",
        "lastName",
        "password",
        "email"
      );
      const newUser = await createNewUser(requiredData);

      // generate OTP and send to the user email address
      req.userId = newUser._id;
      next();
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: "Error", message: "Register failed!" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "Error",
        message: "Both email and password are required",
      });
    }

    const user = await findUserByEmail(email);

    if (!user || !(await userModel.correctPassword(password, user.password))) {
      return res
        .status(400)
        .json({ status: "Error", message: "Email or Password is incorrect!" });
    }

    const tokenData = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      avatar: user.avatar,
    };
    const token = generateAuthToken(tokenData);

    return res.status(200).json({
      status: "success",
      message: "Logged in successfully",
      token,
    });
  } catch (error) {
    return res.status(500).json({ status: "Error", message: "Login failed!" });
  }
};

const forgotPassword = async (req, res) => {
  try {
  } catch (error) {
    return res
      .status(500)
      .json({ status: "Error", message: "Something went wrong" });
  }
};

const resetPassword = async (req, res) => {
  try {
  } catch (error) {
    return res
      .status(500)
      .json({ status: "Error", message: "Something went wrong" });
  }
};

module.exports = { login, register, forgotPassword, resetPassword };
