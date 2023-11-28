const { OneToOneMessageModel } = require("../models/oneToOneMessage");

const userOneToOneConversation = async (userId) => {
  return await OneToOneMessageModel.findOne({
    participants: { $all: [userId] },
  });
};

module.exports = { userOneToOneConversation };
