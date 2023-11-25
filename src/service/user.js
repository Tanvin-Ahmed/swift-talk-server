const { envData } = require("../config/env-config");
const { userModel } = require("../models/user");
const mongoose = require("mongoose");

const updateUserById = async (id, data) => {
  const _id = new mongoose.Types.ObjectId(id);
  return await userModel.findByIdAndUpdate(_id, data, {
    new: true,
    validateModifiedOnly: true,
  });
};

const findUserSocketIdByUserId = async (id) => {
  const _id = new mongoose.Types.ObjectId(id);
  return await userModel.findById(_id).select("socket_id");
};

const getFriendsByUserId = async (userId) => {
  const _id = new mongoose.Types.ObjectId(userId);
  return await userModel.findById(_id).select("_id email friends").populate({
    path: "friends",
    model: envData.user_collection,
    select: "firstName lastName _id email",
  });
};

const findUserById = async (userId) => {
  const _id = new mongoose.Types.ObjectId(userId);
  return await userModel.findById(_id);
};

module.exports = {
  updateUserById,
  findUserSocketIdByUserId,
  getFriendsByUserId,
  findUserById,
};
