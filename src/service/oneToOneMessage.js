const { OneToOneMessageModel } = require("../models/oneToOneMessage");

const createNewConversation = async (info) => {
  return await OneToOneMessageModel.create(info);
};

const userOneToOneConversation = async (userId) => {
  return await OneToOneMessageModel.findOne({
    participants: { $all: [userId] },
  });
};

const getExistingConversationByParticipantsId = async (from, to) => {
  return await OneToOneMessageModel.findOne({
    participants: { $size: 2, $all: [from, to] },
  }).populate("participants", "_id firstName lastName email status");
};

const getConversationById = async (id) => {
  return await OneToOneMessageModel.findById(id).populate(
    "participants",
    "_id firstName lastName email status"
  );
};

const getMessagesByConversationId = async (id) => {
  return await OneToOneMessageModel.findById(id).select("messages");
};

module.exports = {
  userOneToOneConversation,
  getExistingConversationByParticipantsId,
  createNewConversation,
  getConversationById,
  getMessagesByConversationId,
};
