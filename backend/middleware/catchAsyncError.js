module.exports.error = (asyncFunc) => {
  return (req, res, next) => {
    asyncFunc(req, res, next).catch(next)
  }
}