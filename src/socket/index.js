const { findUserById, updateUserById } = require("../service/user");

const socketConnection = (io) => {
  io.on("connection", async (socket) => {
    const user_id = socket.handshake.query["user_id"];
    const socket_id = socket.id;

    // update user socket id in DB
    if (user_id) {
      await updateUserById(user_id, { socket_id });
    }

    // handle friend request
    socket.on("friend_request", async (data) => {
      // data = {to} to is the userId (mongodb id not user socket id)
      const to = await findUserById(data.to);

      // TODO: create a friend request

      io.to(to.socket_id).emit("new_friend_request", {});
    });
  });
};

module.exports = socketConnection;
