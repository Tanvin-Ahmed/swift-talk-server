const bcrypt = require("bcrypt");

const generateHash = async (text, saltRound) => {
  const salt = await bcrypt.genSalt(saltRound);
  const hash = await bcrypt.hash(text, salt);

  return hash;
};

module.exports = { generateHash };
