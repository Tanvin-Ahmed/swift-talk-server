const { envData } = require("../config/env-config");
const { generateAuthToken } = require("../helper/auth/generateAuthToken");
const sendEmail = require("../helper/mailer");
const {
  findUserByEmail,
  findUserByEmailAndUpdate,
  createNewUser,
  findUserByPasswordResetToken,
  findUserById,
} = require("../service/auth");
const { getResetPasswordEmailTemplate } = require("../template/resetPassword");
const { filterObj } = require("../utils/filterObj");
const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");

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

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res
        .status(400)
        .json({ status: "Error", message: "Email or Password is incorrect!" });
    }

    const tokenData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatar: user.avatar,
    };
    const token = generateAuthToken(tokenData);

    return res.status(200).json({
      status: "success",
      message: `Welcome back ${user.firstName}!`,
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: "Error", message: "Login failed!" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await findUserByEmail(email);

    if (!user) {
      res.status(400).json({ status: "Error", message: "User does not exist" });
    }

    // generate random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    try {
      const resetUrl = `${envData.client_url}/auth/new-password?code=${resetToken}`;

      // send email with reset url
      const emailContent = {
        subject: "Reset Password (Swift Talk)",
        body: getResetPasswordEmailTemplate(user.firstName, resetUrl),
      };
      await sendEmail(emailContent, email);
    } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordRestExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        status: "Error",
        message:
          "There was an error sending the email, please try again later.",
      });
    }

    return res
      .status(200)
      .json({ status: "success", message: "Please check your email." });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "Error", message: "Something went wrong" });
  }
};

const resetPassword = async (req, res) => {
  try {
    // get user based on token
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.body.token)
      .digest("hex");
    const user = await findUserByPasswordResetToken(hashedToken);

    // if token is expired or submission is out of time window
    if (!user) {
      return res
        .status(400)
        .json({ status: "Error", message: "Token is Invalid or Expired" });
    }

    // Update user password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordRestExpires = undefined;
    await user.save({ validateBeforeSave: false });

    // login the user with new password and send jwt token

    // TODO: send email to the user about password reset

    const tokenData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatar: user.avatar,
    };
    const token = generateAuthToken(tokenData);

    return res.status(200).json({
      status: "success",
      message: "Password reseated successfully",
      token,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "Error", message: "Something went wrong" });
  }
};

// refresh token
const refreshToken = async (req, res) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    } else {
      return res
        .status(401)
        .json({ status: "Error", message: "Unauthorized access" });
    }

    const decoded = await promisify(jwt.verify)(token, envData.jwt_secret);
    const user = await findUserById(decoded.data.id);
    if (!user) {
      return res
        .status(400)
        .json({ status: "Error", message: "The user doesn't exist" });
    }

    // check if user changed password after token was issued
    if (user.checkPasswordAfter(decoded.iat)) {
      return res.status(400).json({
        status: "Error",
        message: "The user recently changed password. Please login again.",
      });
    }

    const tokenData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatar: user.avatar,
    };
    const newToken = generateAuthToken(tokenData);

    return res.status(200).json(newToken);
  } catch (error) {
    return res.status(401).json({ status: "Error", message: "Invalid token!" });
  }
};

module.exports = {
  login,
  register,
  forgotPassword,
  resetPassword,
  refreshToken,
};
