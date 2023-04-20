const mongoose = require('mongoose')


const connectDatabase = () => {
  const dburi = process.env.DATABASE_URL
    .replace('<MONGO_USERNAME>', process.env.MONGO_USERNAME)
    .replace('<MONGO_PASSWORD>', process.env.MONGO_PASSWORD)

  mongoose.connect(dburi, { useNewUrlParser: true, useUnifiedTopology: true })

  mongoose.connection.on('connected', () => {
    console.log('Connected to database.');
  })
}

module.exports.connectDatabase = connectDatabase