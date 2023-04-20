const { ErrorHandler } = require("../utils/errorHandler")

module.exports.error = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.message = err.message || 'Internal server error'

  //wrong mongodb id error
  if (err.name === 'CastError') {
    const message = `resource not found. Invalid: ${err.path}`
    err = new ErrorHandler(message, 400)
  }
  //mongoose duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} entered`
    err = new ErrorHandler(message, 400)
  }
  //wrong jwt error
  if (err.name === 'jsonWebTokenError') {
    const message = `Json Web Token is invalid, try again.`
    err = new ErrorHandler(message, 400)
  }

  //jwt expire error
  if (err.name === 'jsonWebTokenError') {
    const message = `Json Web Token is Expired, try again.`
    err = new ErrorHandler(message, 400)
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message
  })
}