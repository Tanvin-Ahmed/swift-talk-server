const {
  getFriendRequestByRecipientId,
  getFriendRequestOfUser,
  getFriendRequestBySenderId,
} = require("../service/friendRequest");
const {
  updateUserById,
  getFriendsByUserId,
  getAllUsersWithoutRequestedUser,
  getAllFriend,
} = require("../service/user");
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
    const { search, limit, page } = req.query;
    const offset = Number(page) * Number(limit);

    // get friends id and friend request senders id and my friend request recipients id
    // those 3 types of users should be ignored
    const friendRequests = await getFriendRequestOfUser(req.user._id);
    // covert BSON object to JSON object
    const friendRequestJson = JSON.parse(JSON.stringify(friendRequests));
    const oppositeUsersId = friendRequestJson.map((request) => {
      if (request.sender === req.user._id.toString()) {
        return request.recipient.toString();
      } else {
        return request.sender.toString();
      }
    });

    const userInfo = await getAllFriend(req.user._id);
    // covert BSON object to JSON object
    const userInfoJson = JSON.parse(JSON.stringify(userInfo));

    const ignoredIds = [
      ...new Set([
        ...oppositeUsersId,
        ...userInfoJson.friends,
        req.user._id.toString(),
      ]),
    ];

    const users = await getAllUsersWithoutRequestedUser(
      search,
      limit,
      offset,
      ignoredIds
    );

    return res.status(200).json({
      status: "success",
      data: users,
      hasNext: users?.length === Number(limit),
      message: "Get friends successfully",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: "Error", message: "Something went wrong" });
  }
};

const getFriends = async (req, res) => {
  try {
    const { search, limit, page } = req.query;
    const offset = Number(limit) * Number(page);
    const user = await getFriendsByUserId(req.user._id, search, limit, offset);

    return res.status(200).json({
      status: "success",
      data: user.friends,
      hasNext: user.friends?.length === Number(limit),
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
    const { search, limit, page } = req.query;
    const offset = Number(limit) * Number(page);
    const friendRequest = await getFriendRequestByRecipientId(
      req.user._id,
      search,
      limit,
      offset
    );

    return res.status(200).json({
      success: "success",
      data: friendRequest,
      hasNext: friendRequest.length === Number(limit),
      message: "Friend request found successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "Error", message: "No friend request found" });
  }
};

const getFriendRequestThatUserSent = async (req, res) => {
  try {
    const { search, limit, page } = req.query;
    const offset = Number(limit) * Number(page);
    const friendRequest = await getFriendRequestBySenderId(
      req.user._id,
      search,
      limit,
      offset
    );

    return res.status(200).json({
      success: "success",
      data: friendRequest,
      hasNext: friendRequest.length === Number(limit),
      message: "Friend request found successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "Error", message: "No friend request found" });
  }
};

module.exports = {
  updateMe,
  getUsers,
  getFriends,
  getFriendRequest,
  getFriendRequestThatUserSent,
};
