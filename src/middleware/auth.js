const otpGenerator = require("otp-generator");
const { generateAuthToken } = require("../helper/auth/generateAuthToken");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const { envData } = require("../config/env-config");
const sendEmail = require("../helper/mailer");
const {
  findUserByIdAndUpdate,
  findUserWithValidOTP,
  findUserById,
} = require("../service/auth");
const { getOtpEmailTemplate } = require("../template/otp");

const protect = async (req, res, next) => {
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

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ status: "Error", message: "Invalid token!" });
  }
};

const sendOTP = async (req, res) => {
  try {
    const { userId } = req;
    const otp = otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      specialChars: false,
      upperCaseAlphabets: false,
      digits: true,
    });
    const otpExpiryTime = Date.now() + 10 * 60 * 1000; // 10 minutes

    const user = await findUserByIdAndUpdate(userId, { otpExpiryTime });
    user.otp = otp.toString();
    await user.save({ new: true, validateModifiedOnly: true });

    // TODO: send email to the user
    const emailContent = {
      subject: "OTP for verify email (Swift Talk)",
      body: getOtpEmailTemplate(req.body.firstName, otp),
    };
    await sendEmail(emailContent, req.body.email);

    res.status(200).json({
      status: "success",
      message:
        "Check your email address to get OTP to continue the next process of registration",
    });
  } catch (error) {
    return res.status(500).json({
      status: "Error",
      message: "Something went wrong. Please try again",
    });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await findUserWithValidOTP(email);

    if (!user) {
      return res
        .status(400)
        .json({ status: "Error", message: "Email is invalid or OTP expired" });
    }

    if (user.verified) {
      return res.status(400).json({
        status: "error",
        message: "Email is already verified",
      });
    }

    if (!(await user.correctOTP(otp, user.otp))) {
      return res
        .status(400)
        .json({ status: "Error", message: "OTP is incorrect" });
    }

    user.verified = true;
    user.otp = undefined;
    await user.save({ new: true, validateModifiedOnly: true });

    const tokenData = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatar: user.avatar,
      id: user._id,
    };
    const token = generateAuthToken(tokenData);

    return res.status(200).json({
      status: "success",
      message: "OTP verified successfully",
      token,
    });
  } catch (error) {
    return res.status(500).json({
      status: "Error",
      message: "Something went wrong. Please try again",
    });
  }
};

module.exports = { sendOTP, verifyOTP, protect };
