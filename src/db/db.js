const mongoose = require("mongoose");
const { envData } = require("../config/env-config");

(() => {
  if (!envData.db_url) return console.log("Database URL not specified");

  mongoose
    .connect(envData.db_url)
    .then(() => {
      console.log("Database connection established!");
    })
    .catch((err) => console.log(err));
})();

module.exports = mongoose;
