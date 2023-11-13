const { envData } = require("../config/env-config");
const { userModel } = require("../models/user");

const updateUserById = async (id, data) => {
  return await userModel.findByIdAndUpdate(id, data, {
    new: true,
    validateModifiedOnly: true,
  });
};

const findUserById = async (id) => {
  return await userModel.findById(id);
};

const getFriendsByUserId = async (userId) => {
  return await userModel.findById(userId).select("_id email friends").populate({
    path: "friends",
    model: envData.user_collection,
    select: "firstName lastName _id email",
  });
};

module.exports = { updateUserById, findUserById, getFriendsByUserId };
