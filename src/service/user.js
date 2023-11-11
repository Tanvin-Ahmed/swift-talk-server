const { userModel } = require("../models/user");

const updateUserById = async (id, data) => {
  return await userModel.findByIdAndUpdate(id, data, {
    new: true,
    validateModifiedOnly: true,
  });
};

module.exports = { updateUserById };
