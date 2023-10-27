const mongoose = require("mongoose");
const { comparePassword } = require("../helper/auth/comparePassword");

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
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

userSchema.methods.correctPassword = async (plainPassword, hashedPassword) => {
  return await comparePassword(plainPassword, hashedPassword);
};

module.exports.userModel = mongoose.model("User", userSchema);
