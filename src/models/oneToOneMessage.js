const mongoose = require("mongoose");
const { envData } = require("../config/env-config");

const schema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.ObjectId,
        ref: envData.user_collection,
      },
    ],
    messages: [
      {
        to: {
          type: mongoose.Schema.ObjectId,
          ref: envData.user_collection,
        },
        from: {
          type: mongoose.Schema.ObjectId,
          ref: envData.user_collection,
        },
        type: {
          type: String,
          enum: ["Text", "Media", "Document", "Link"], // possible values
        },
        createdAt: {
          type: Date,
          default: Date.now(),
        },
        text: {
          type: String,
        },
        file: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports.OneToOneMessageModel = mongoose.model(
  envData.one_to_one_msg_collection,
  schema
);
