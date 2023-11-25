const { getFriendRequestByRecipientId } = require("../service/friendRequest");
const { updateUserById, getFriendsByUserId } = require("../service/user");
const { filterObj } = require("../utils/filterObj");

const updateMe = async (req, res) => {
  const { user } = req;

  // grab these properties of user object which I want to update in DB
  const filteredData = filterObj(
    req.body,
    "firstName",
    "lastName",
    "about",
    "avatar"
  );

  const updatedUserInfo = await updateUserById(user._id, filteredData);

  return res.status(201).json({
    status: "success",
    data: updatedUserInfo,
    message: "Profile updated successfully",
  });
};

const getUsers = async (req, res) => {
  try {
    const myFriends = await getFriendsByUserId(req.user._id);

    return res.status(200).json({
      status: "success",
      data: myFriends,
      message: "Get friends successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "Error", message: "Something went wrong" });
  }
};

const getFriends = async (req, res) => {
  try {
    const user = await getFriendsByUserId(req.user._id);

    return res.status(200).json({
      status: "success",
      data: user.friends,
      message: "Friends found successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "Error", message: "Friends not found" });
  }
};

const getFriendRequest = async (req, res) => {
  try {
    const friendRequest = await getFriendRequestByRecipientId(req.user._id);

    return res.status(200).json({
      success: "success",
      data: friendRequest,
      message: "Friend request found successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "Error", message: "No friend request found" });
  }
};

module.exports = { updateMe, getUsers, getFriends, getFriendRequest };
