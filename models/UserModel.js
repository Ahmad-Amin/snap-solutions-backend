const mongoose = require("../mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  name: String,
  status: String,
  amount: String,
  additionalUserDetails: {
    description: String,
    roleDescription: String,
    companyName: String,
    companyAddress: String,
    phoneNumber: String,
    achievements: String,
    references: String,
  },
  investType: {
    name: String,
    role: String,
  },
  displayImage: Buffer
});

const UserModel = mongoose.model("User", UserSchema);
module.exports = UserModel;
