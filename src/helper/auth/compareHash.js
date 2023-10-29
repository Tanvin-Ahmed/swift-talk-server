const bcrypt = require("bcrypt");

module.exports.compareHash = async (text, hash) => {
  return await bcrypt.compare(text, hash);
};
