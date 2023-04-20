const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your name.'],
    maxLength: [30, 'Name must be at most 30 characters long.'],
    minLength: [4, 'Name must be at least 4 characters long.'],
  },
  email: {
    type: String,
    required: [true, 'Please enter your email.'],
    unique: true,
    validate: [validator.isEmail, 'Please enter a valid email address.']
  },
  password: {
    type: String,
    required: [true, 'Please enter your password.'],
    minLength: [8, 'password must be at least 8 characters long.'],
    select: false
  },
  avatar: {
    public_id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  },
  role: {
    type: String,
    default: 'user'
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
})
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next()
  }
  const salt = await bcryptjs.genSalt(8)
  this.password = await bcryptjs.hash(this.password, salt)
})

//JWT TOKEN
UserSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE })
}

//Compare password
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password)
}

//generate reset password token
UserSchema.methods.getResetPasswordToken = function () {
  //generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  //hasing and adding to userSchema
  const tokenCrypto = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.resetPasswordToken = tokenCrypto;
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  return resetToken;
}



module.exports.modal = mongoose.model('User', UserSchema, 'users')