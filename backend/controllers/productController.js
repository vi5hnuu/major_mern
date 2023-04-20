const { ErrorHandler } = require('../utils/errorHandler');
const { model: Product } = require('./../modals/productModal')
const { error: catchasyncError } = require('../middleware/catchAsyncError')
const { ApiFeatures } = require('../utils/apifeatures');

//create product --admin
exports.createProduct = catchasyncError(async (req, res, next) => {
  req.body.user = req.user.id
  const product = await new Product(req.body).save();
  res.status(200).json({ success: true, product })
})

//get all product
exports.getAllProducts = catchasyncError(async (req, res, next) => {
  const resultPerPage = 5;
  const productCount = await Product.countDocuments()
  const apifeatures = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage)

  const products = await apifeatures.query
  res.status(200).json({ success: true, products, productCount })
})

//get single product
exports.getProductDetails = catchasyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
  if (!product) {
    return next(new ErrorHandler('product not found', 500))
  }
  res.status(200).json({ success: true, product })
})

//update product --admin
exports.updateProduct = catchasyncError(async (req, res, next) => {
  let product = await Product.findOne({ _id: req.params.id })
  if (!product) {
    return next(new ErrorHandler('product not found', 500))
  }

  product = await Product.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, runValidators: true })
  res.status(200).json({ success: true, product })
})

//delete product --admin
exports.deleteProduct = catchasyncError(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id)
  if (!product) {
    return next(new ErrorHandler('product not found', 500))
  }
  res.status(200).json({ success: true, product })
})

//create new review or update the review
exports.createproductReview = catchasyncError(async (req, res, next) => {
  const { rating, comment, productId } = req.body
  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment
  }

  const product = await Product.findById(productId)
  const isReviewed = product.reviews.find(review => review.user.toString() === req.user._id.toString())
  if (isReviewed) {
    isReviewed.rating = Number(rating)
    isReviewed.comment = comment
  } else {
    product.reviews.push(review)
    product.numOfReviews = product.reviews.length
  }
  let avg = 0;
  product.reviews.forEach((review) => {
    avg += review.rating
  })
  avg /= product.reviews.length
  product.ratings = avg
  await product.save()

  res.status(200).json({
    success: true
  })
})

//get all reviews of a product
exports.getProductReviews = catchasyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.id)
  if (!product) {
    return next(new ErrorHandler(`Product not found`, 404))
  }
  res.status(200).json({
    success: true,
    reviews: product.reviews
  })
})
//delete review of a product
exports.deleteReview = catchasyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.productId)
  if (!product) {
    return next(new ErrorHandler(`Product not found`, 404))
  }
  const reviews = product.reviews.filter((review) => {
    return review._id.toString() !== req.query.id.toString()
  })
  //calc avg ratings
  let avg = 0;
  reviews.forEach((review) => {
    avg += review.rating
  })
  const ratings = reviews.length ? avg / reviews.length : 0
  const numOfReviews = reviews.length
  const updatedProduct = await Product.findByIdAndUpdate(req.query.productId, {
    reviews, ratings, numOfReviews
  }, {
    new: true,
    runValidators: true,
    useFindAndModify: false
  })

  res.status(200).json({
    success: true,
    reviews: updatedProduct.reviews
  })

})