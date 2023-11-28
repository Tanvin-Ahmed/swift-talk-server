const { FriendRequestModel } = require("../models/friendRequest");
const mongoose = require("mongoose");

const createFriendRequest = async (info) => {
  return await FriendRequestModel.create(info);
};

const getFriendRequestByRecipientId = async (
  recipientId,
  searchKey,
  limit,
  offset
) => {
  const _id = new mongoose.Types.ObjectId(recipientId);

  return await FriendRequestModel.find({ _id })
    .populate({
      path: "sender",
      model: envData.user_collection,
      select: "_id firstName lastName status",
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

const getFriendRequestBySenderId = async (
  senderId,
  searchKey,
  limit,
  offset
) => {
  const _id = new mongoose.Types.ObjectId(senderId);

  return await FriendRequestModel.find({ _id })
    .populate({
      path: "recipient",
      model: envData.user_collection,
      select: "_id firstName lastName status",
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

const getFriendRequestOfUser = async (userId) => {
  const _id = new mongoose.Types.ObjectId(userId);
  return await FriendRequestModel.find({
    $or: [{ recipient: _id }, { sender: _id }],
  });
};

const findRequestById = async (requestId) => {
  const _id = new mongoose.Types.ObjectId(requestId);
  return await FriendRequestModel.findById(_id);
};

const deleteRequestById = async (requestId) => {
  const _id = new mongoose.Types.ObjectId(requestId);
  return await FriendRequestModel.findByIdAndDelete(_id);
};

module.exports = {
  getFriendRequestByRecipientId,
  createFriendRequest,
  findRequestById,
  deleteRequestById,
  getFriendRequestOfUser,
  getFriendRequestBySenderId,
};
