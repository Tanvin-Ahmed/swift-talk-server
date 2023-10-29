const mongoose = require("mongoose");
const { compareHash } = require("../helper/auth/compareHash");
const { generateHash } = require("../helper/auth/generateHash");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First Name is required"],
    },
    lastName: {
      type: String,
      required: [true, "Last Name is required"],
    },
    avatar: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      validate: {
        validator: (email) => {
          const regX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
          return regX.test(String(email).toLowerCase());
        },
        message: ({ value }) => `Email (${value}) is invalid`,
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    passwordChangedAt: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
    },
    passwordRestExpires: {
      type: Date,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: Number,
    },
    otpExpiryTime: {
      type: Date,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

userSchema.pre("save", async (next) => {
  if (!this.isModified("otp")) return next();

  this.otp = await generateHash(this.otp, 10);
  next();
});

userSchema.methods.correctPassword = async (plainPassword, hashedPassword) => {
  return await compareHash(plainPassword, hashedPassword);
};

userSchema.methods.correctOTP = async (plainOTP, hashedOTP) => {
  return await compareHash(plainOTP, hashedOTP);
};

module.exports.userModel = mongoose.model("User", userSchema);
