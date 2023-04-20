const express = require('express')
const { error: errorMW } = require('./middleware/error')
const { route: productRoute } = require('./routes/productRoute')
const { route: userRoute } = require('./routes/userRoute')
const { route: orderRoute } = require('./routes/orderRoute')
const cookieParser = require('cookie-parser')

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use('/api/v1', productRoute)
app.use('/api/v1', userRoute)
app.use('/api/v1', orderRoute)

app.use(errorMW)

module.exports.app = app;