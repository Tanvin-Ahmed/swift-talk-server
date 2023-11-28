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

const getFriendsByUserId = async (userId, searchKey, limit, offset) => {
  const _id = new mongoose.Types.ObjectId(userId);

  return await userModel
    .findOne({ _id })
    .select("_id email friends")
    .populate({
      path: "friends",
      model: envData.user_collection,
      select: "firstName lastName _id email status",
      match: {
        $or: [
          { firstName: { $regex: new RegExp(searchKey, "i") } },
          { lastName: { $regex: new RegExp(searchKey, "i") } },
        ],
      },
    })
    .limit(limit)
    .skip(offset);
};

const getAllFriend = async (userId) => {
  const _id = new mongoose.Types.ObjectId(userId);
  return await userModel.findById(_id).select("friends _id");
};

const getAllUsersWithoutRequestedUser = async (
  searchKey,
  limit,
  offset,
  excludeUsersId
) => {
  const ids = excludeUsersId.map((id) => new mongoose.Types.ObjectId(id));
  return await userModel
    .find({
      $or: [
        { firstName: { $regex: new RegExp(searchKey, "i") } },
        { lastName: { $regex: new RegExp(searchKey, "i") } },
      ],
      // to ignore multiple ids
      _id: { $nin: ids },
      verified: true,
    })
    .skip(offset)
    .limit(limit);
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
  getAllUsersWithoutRequestedUser,
  getAllFriend,
};
