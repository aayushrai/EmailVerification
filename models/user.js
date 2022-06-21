const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  token: {
    type: String,
  },
});

const User = mongoose.model("user", userSchema);

module.exports = {
  User,
};
