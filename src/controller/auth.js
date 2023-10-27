const { generateAuthToken } = require("../helper/auth/generateAuthToken");
const { userModel } = require("../models/user");
const { findPasswordByEmail, findUserByEmail } = require("../service/user");

const login = async (req, res, next) => {
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
