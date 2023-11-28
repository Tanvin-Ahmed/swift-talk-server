const {
  createFriendRequest,
  findRequestById,
  deleteRequestById,
} = require("../service/friendRequest");
const { userOneToOneConversation } = require("../service/oneToOneMessage");
const {
  updateUserById,
  findUserSocketIdByUserId,
  findUserById,
} = require("../service/user");
const path = require("path");

const socketConnection = (io) => {
  io.on("connection", async (socket) => {
    const userId = socket.handshake.query["userId"];
    const socketId = socket.id;

    // update user socket id in DB
    if (userId) {
      await updateUserById(userId, { socket_id: socketId, status: "Online" });
    }

    // handle friend request
    socket.on("friend_request", async (data) => {
      // data = {to, from} both are the userId (mongodb id not user socket id)
      const sender = await findUserSocketIdByUserId(data.from);
      const receiver = await findUserSocketIdByUserId(data.to);

      await createFriendRequest({ sender: data.from, recipient: data.to });

      // emit event to friend request receiver => new friend request received
      io.to(receiver.socket_id).emit("new_friend_request", {
        message: "New friend request received",
        userId: data.from,
      });

      // emit event to friend request sender => new friend request sent
      io.to(sender.socket_id).emit("friend_request_sent", {
        message: "Request sent successfully!",
        userId: data.to,
      });
    });

    socket.on("cancel_request", async (data) => {
      // data = {requestId}
      const request = await findRequestById(data.requestId);
      const sender = await findUserSocketIdByUserId(request.sender);
      const receiver = await findUserSocketIdByUserId(request.recipient);
      await deleteRequestById(data.requestId);

      if (sender) {
        io.to(sender.socket_id).emit("cancel_request_by_me", {
          requestId: data.requestId,
          message: "Remove request",
        });
      }

      if (receiver) {
        io.to(receiver.socket_id).emit("cancel_request_by_sender", {
          requestId: data.requestId,
          message: "Remove request",
        });
      }
    });

    socket.on("accept_friend_request", async (data) => {
      // data = {requestId}
      // requestId = friendRequest document id(_id field) in mongoDB
      const requestDoc = await findRequestById(data.requestId);

      // get both sender and receiver information from DB
      const sender = await findUserById(requestDoc.sender);
      const receiver = await findUserById(requestDoc.recipient);

      // update friend list for both sender and receiver and save into DB
      sender.friends.push(requestDoc.recipient);
      receiver.friends.push(requestDoc.sender);
      await sender.save({ new: true, validateModifiedOnly: true }); // {new: true} means that after saving this document it returns new updated documents
      await receiver.save({ new: true, validateModifiedOnly: true });

      // delete request documents from friedRequest collection in DB
      await deleteRequestById(data.requestId);

      // emit event for sender => friend request accepted
      io.to(sender.socket_id).emit("friend_request_accepted", {
        message: "Friend request accepted!",
        requestId: data.requestId,
      });
      // emit event for receiver => friend request accepted
      io.to(receiver.socket_id).emit("friend_request_accepted", {
        message: "Friend request accepted!",
        requestId: data.requestId,
      });
    });

    socket.on("get_direct_conversations", async ({ userId }, callback) => {
      const existingConversation = await userOneToOneConversation(userId);
      callback(existingConversation);
    });

    socket.on("text_message", (data) => {
      // data = {to, from, text}
      // create a new conversation if it already doesn't exist yet or add new message to the messages list
      // save to DB
      // emit event for receiver => incoming message
      // emit event for sender => outgoing message
    });

    socket.on("file_message", (data) => {
      // data = {to, from, text, file}
      // get the file extension
      const fileExtension = path.extname(data.file.name);

      // generate a unique filename
      const filename = `${Date.now()}_${Math.floor(
        Math.random() * 1000
      )}${fileExtension}`;

      // upload this file into AWS s3
      // create a new conversation if it already doesn't exist yet or add new message to the messages list
      // save to DB
      // emit event for receiver => incoming message
      // emit event for sender => outgoing message
    });

    socket.on("disconnect", async () => {
      if (userId) {
        await updateUserById(userId, { socket_id: "", status: "Offline" });
      }

      // Todo: broadcast user
      socket.disconnect(0); // disconnect the particular socket connection
    });
  });
};

module.exports = socketConnection;
