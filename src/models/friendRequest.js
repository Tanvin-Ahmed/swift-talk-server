const mongoose = require("mongoose");
const { envData } = require("../config/env-config");

const schema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.ObjectId,
      ref: envData.user_collection,
    },
    recipient: {
      type: mongoose.Schema.ObjectId,
      ref: envData.user_collection,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports.FriendRequestModel = mongoose.model(
  envData.friend_request_collection,
  schema
);
