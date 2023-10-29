const { userModel } = require("../models/user");

const createNewUser = async (data) => {
  return await userModel.create(data);
};

const findUserByEmail = async (email) => {
  return await userModel.findOne({ email });
};

const findUserWithValidOTP = async (email) => {
  return await userModel.findOne({ email, otpExpiryTime: { $gt: Date.now() } });
};

const findUserByEmailAndUpdate = async (email, data) => {
  return await userModel.findOneAndUpdate({ email }, data, {
    new: true,
    validateModifiedOnly: true,
  });
};

const findUserByIdAndUpdate = async (id, data) => {
  return await userModel.findByIdAndUpdate(id, data, {
    new: true,
    validateModifiedOnly: true,
  });
};

module.exports = {
  findUserByEmail,
  findUserByEmailAndUpdate,
  createNewUser,
  findUserByIdAndUpdate,
  findUserWithValidOTP,
};
