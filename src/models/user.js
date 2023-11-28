const mongoose = require("mongoose");
const { compareHash } = require("../helper/auth/compareHash");
const { generateHash } = require("../helper/auth/generateHash");
const crypto = require("crypto");
const { envData } = require("../config/env-config");

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
    passwordConfirm: {
      type: String,
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
      type: String,
    },
    otpExpiryTime: {
      type: Date,
    },
    socket_id: {
      type: String,
    },
    friends: [
      {
        type: mongoose.Schema.ObjectId,
        ref: envData.user_collection,
      },
    ],
    status: {
      type: String,
      enum: ["Online", "Offline"],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  // Only run this function if otp was actually modified
  if (!this.isModified("otp") || !this.otp) return next();

  // Hash the otp with cost of 10
  this.otp = await generateHash(this.otp, 10);
  next();
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await generateHash(this.password, 10);
  next();
});

userSchema.methods.correctPassword = async (plainPassword, hashedPassword) => {
  return await compareHash(plainPassword, hashedPassword);
};

userSchema.methods.correctOTP = async (plainOTP, hashedOTP) => {
  return await compareHash(plainOTP, hashedOTP);
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordRestExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

userSchema.methods.checkPasswordAfter = function (timestamp) {
  return timestamp < this.passwordChangedAt;
};

module.exports.userModel = mongoose.model(envData.user_collection, userSchema);
