const { updateUserById } = require("../service/user");
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

module.exports = { updateMe };
