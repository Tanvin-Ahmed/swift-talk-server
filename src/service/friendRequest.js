const { FriendRequestModel } = require("../models/friendRequest");

const createFriendRequest = async (info) => {
  return await FriendRequestModel.create(info);
};

const getFriendRequestByRecipientId = async (recipientId) => {
  const _id = new mongoose.Types.ObjectId(recipientId);
  return await FriendRequestModel.find({ recipient: _id }).populate(
    "sender",
    "_id firstName lastName"
  );
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
};
