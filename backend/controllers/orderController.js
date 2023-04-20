const { modal: Order } = require('./../modals/orderModal.js')
const { ErrorHandler } = require('../utils/errorHandler');
const { model: Product } = require('./../modals/productModal')
const { error: catchasyncError } = require('../middleware/catchAsyncError')

//create new order
exports.newOrder = catchasyncError(async (req, res, next) => {
  const { shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice } = req.body
  const order = await new Order({
    shippingPrice,
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user.id
  }).save()

  res.status(200).json({
    success: true,
    order
  })
})

//get single order
exports.getSingleOrder = catchasyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate("user", "name email")
  if (!order) {
    return next(new ErrorHandler(`Order not found with id ${req.params.id}`, 404))
  }

  res.status(200).json({
    success: true,
    order
  })
})
//get loggedin user orders
exports.myOrders = catchasyncError(async (req, res, next) => {
  const orders = await Order.find({ user: req.user.id })
  res.status(200).json({
    success: true,
    orders
  })
})

//get all orders (admin)
exports.getAllOrders = catchasyncError(async (req, res, next) => {
  const orders = await Order.find()
  let totalAmount = orders.reduce((pv, order) => pv + order.totalPrice, 0)
  res.status(200).json({
    success: true,
    orders,
    totalAmount
  })
})
//update order status (admin)
exports.updateOrder = catchasyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
  if (!order) {
    return next(new ErrorHandler('Order not found.'))
  }

  if (order.orderStatus === 'Delivered') {
    return next(new ErrorHandler('You have already delivered this order.'))
  }

  await (async () => {
    order.orderItems.forEach(async (item) => {
      await updateStock(item.product, item.quantity)
    })
  })()
  order.orderStatus = req.body.status
  if (req.body.status === 'Delivered') {
    order.deliveredAt = Date.now()
  }
  await order.save({ validateBeforeSave: false })
  res.status(200).json({
    success: true,
    order,
  })
})

//delete order
exports.deleteOrder = catchasyncError(async (req, res, next) => {
  const order = await Order.findByIdAndDelete(req.params.id)
  if (!order) {
    return next(new ErrorHandler('Order not found for this id.'))
  }
  res.status(200).json({
    success: true,
    order,
  })
})

async function updateStock(pid, quantity) {
  const product = await Product.findById(pid);
  product.stock -= quantity;
  await product.save({ validateBeforeSave: false });
}