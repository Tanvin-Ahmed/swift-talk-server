const otpGenerator = require("otp-generator");
const {
  findUserByIdAndUpdate,
  findUserWithValidOTP,
} = require("../service/user");
const { generateAuthToken } = require("../helper/auth/generateAuthToken");

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

    await findUserByIdAndUpdate(userId, { otp, otpExpiryTime });

    // TODO: send email to the user

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

const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await findUserWithValidOTP(email);

    if (!user) {
      return res
        .status(400)
        .json({ status: "Error", message: "Email is invalid or OTP expired" });
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
      password: user.password,
      avatar: user.avatar,
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

module.exports = { sendOTP, verifyOTP };
