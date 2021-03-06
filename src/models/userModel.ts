import mongoose = require("mongoose");
import bcrypt = require("bcrypt");
import crypto = require("crypto");
import { userTypes } from "../interfaces/interfaces";
import dotenv from 'dotenv';
dotenv.config();
const Schema = mongoose.Schema;


const UserModel = new Schema({
  email: {
    type: String,
    require: true,
    unique: true,
  },
  firstName: {
    type: String,
    require: true,
  },
  lastName: {
    type: String,
    require: true,
  },

  password: {
    type: String,
    require: true,
  },
  phone: {
    type: String,
  },
  role: {
    type: String,
    enum: Object.keys(userTypes),
    default: userTypes.USER,
    require: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  profileImage:{
    type: String,
    default: process.env.DEFAULT_USER_PHOTO
  },
  userName: String,
  emailVerificationCode: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

UserModel.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
  next();
});
UserModel.methods.isValidPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

UserModel.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", UserModel);
export default User;
