const { userModel } = require("../models/user");

const findUserByEmail = async (email) => {
  return await userModel.findOne({ email });
};

const findPasswordByEmail = async (email) => {
  return await userModel.findOne({ email }).select("password");
};

module.exports = { findUserByEmail, findPasswordByEmail };
