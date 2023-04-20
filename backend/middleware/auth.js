const { error: catchAsyncError } = require('./catchAsyncError')
const { ErrorHandler } = require('../utils/errorHandler');
const jwt = require('jsonwebtoken');
const { modal: UserModal } = require('../modals/usermodal');

const isAuthenticatedUser = catchAsyncError(async (req, res, next) => {
  const { token } = req.cookies
  if (!token) {
    return next(new ErrorHandler('please login to access this resource.', 401))
  }

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await UserModal.findById(decodedData.id)
  next()
})

module.exports.authorizedRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ErrorHandler(`Role: '${req.user.role}' is not alloweded to acces this resources.`, 403))
    }
    next()
  }
}

module.exports.isAuthenticatedUser = isAuthenticatedUser