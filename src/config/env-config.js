module.exports.envData = {
  db_url: process.env.DB_URL,
  jwt_secret: process.env.JWT_SECRET_KEY,
  client_url: process.env.CLIENT_URL,

  user_collection: process.env.USER_COLLECTION,
  friend_request_collection: process.env.FRIEND_REQUEST_COLLECTION,
  one_to_one_msg_collection: process.env.ONE_TO_ONE_MESSAGE_COLLECTION,
};
