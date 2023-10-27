const jwt = require("jsonwebtoken");
const { envData } = require("../../config/env-config");

module.exports.generateAuthToken = (data) => {
  return jwt.sign({ data }, envData.jwt_secret, { expiresIn: "5d" });
};
