const {
  createFriendRequest,
  findRequestById,
  deleteRequestById,
} = require("../service/friendRequest");
const {
  updateUserById,
  findUserSocketIdByUserId,
  findUserById,
} = require("../service/user");

const socketConnection = (io) => {
  io.on("connection", async (socket) => {
    const userId = socket.handshake.query["userId"];
    const socketId = socket.id;

    console.log("Inside socket: " + userId);
    // update user socket id in DB
    if (userId) {
      await updateUserById(userId, { socket_id: socketId });
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
      });

      // emit event to friend request sender => new friend request sent
      io.to(sender.socket_id).emit("friend_request_sent", {
        message: "Request sent successfully!",
      });
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
      });
      // emit event for receiver => friend request accepted
      io.to(receiver.socket_id).emit("friend_request_accepted", {
        message: "Friend request accepted!",
      });
    });

    socket.on("end", () => {
      socket.disconnect(0); // disconnect the particular socket connection
    });
  });
};

module.exports = socketConnection;
