const { ErrorHandler } = require('../utils/errorHandler');
const { error: catchasyncError } = require('../middleware/catchAsyncError');
const { modal: User } = require('../modals/usermodal');
const { sendToken } = require('../utils/jwtToken')
const { sendMail } = require('../utils/sendEmail')
const crypto = require('crypto');

//register user
exports.registerUser = catchasyncError(async (req, res, next) => {
  const { name, email, password } = req.body;

  const user = await new User({ name, email, password, avatar: { public_id: "sample id", url: "profile url" } }).save()

  sendToken(user, 201, res)
})

//login user
exports.loginuser = catchasyncError(async (req, res, next) => {
  const { email, password } = req.body;
  //checking if user has given pass and email
  if (!email || !password) {
    return next(new ErrorHandler('Please enter a valid Email/Password.', 400))
  }

  const user = await User.findOne({ email }).select("+password")
  if (!user) {
    return next(new ErrorHandler('Invalid Email/Password.', 401))
  }

  const isPassMatched = await user.comparePassword(password)
  if (!isPassMatched) {
    return next(new ErrorHandler('Invalid Email/Password.', 401))
  }

  sendToken(user, 200, res)
})

//log out user
exports.logoutuser = catchasyncError(async (req, res, next) => {
  res.clearCookie('token', { expiresIn: new Date(Date.now()), httpOnly: true })
  res.status(200).json({
    success: true,
    message: 'Logout successful.'
  })
})

//forgot password
exports.forgotpassword = catchasyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorHandler('User not found.', 404))
  }
  //get reset password token
  const resetToken = user.getResetPasswordToken()
  await user.save({ validateBeforeSave: false })

  const resetPasswordUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`
  const message = `Your password reset token is :- \n\n${resetPasswordUrl}\n\nIf you have not requested this email then please ignore it.`

  try {
    await sendMail({
      email: user.email,
      subject: 'Ecommerce reset password',
      message
    });
    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`
    })
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false })
    return next(new ErrorHandler(err.message, 500))
  }
})

//reset password
exports.resetpassword = catchasyncError(async (req, res, next) => {
  //create token has
  const resetpassToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
  const user = await User.findOne({ resetPasswordToken: resetpassToken, resetPasswordExpire: { $gt: Date.now() } })

  if (!user) {
    return next(new ErrorHandler('Reset password token is invalid or has been expired', 400))
  }

  if (req.body.password != req.body.confirmPassword) {
    return next(new ErrorHandler('password and confirm password do not match.', 400))
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  sendToken(user, 200, res)
})

//Get User details
exports.getUserDetails = catchasyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  console.log(req.user);
  res.status(200).json({
    success: true,
    user
  })
})

//Update user password
exports.updatePassword = catchasyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  const isMatched = await user.comparePassword(req.body.oldPassword)
  if (!isMatched) {
    return next(new ErrorHandler("old password is incorrect", 400))
  }
  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("new password and confirm password does not match", 400))
  }
  user.password = req.body.newPassword;
  await user.save();
  sendToken(user, 200, res);
  res.status(200).json({
    success: true,
    user
  })
})

//Update user profile
exports.updateProfile = catchasyncError(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  }
  //TODO: add cloudinary for avatart later
  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false
  })
  res.status(200).json({
    success: true,
    user
  })
})

//get all users (admin)
exports.getAllUsers = catchasyncError(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users
  })
})

//get user details (admin)
exports.getSingleUser = catchasyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorHandler(`User does not exists with id : ${req.params.id}`));
  }
  res.status(200).json({
    success: true,
    user
  })
})


//Update user Role (admin)
exports.updateUserRole = catchasyncError(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role
  }
  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false
  })
  res.status(200).json({
    success: true,
    user
  })
})

//Delete user (admin)
exports.deleteUser = catchasyncError(async (req, res, next) => {
  //TODO: we remove cloudinary for avatart later
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorHandler(`User does not exist with id ${req.params.id}`));
  }
  await user.deleteOne()
  res.status(200).json({
    success: true,
    message: 'user deleted successfully.'
  })
})