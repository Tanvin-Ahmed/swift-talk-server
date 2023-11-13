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

module.exports = { updateMe, getUsers };
