const { app } = require('./app')
const path = require('path')
const dotenv = require('dotenv')
const { connectDatabase } = require('./config/database')

process.on('uncaughtException', (er) => {
  console.log(`Error: ${er.message}`);
  console.log('shutting down server....');
  process.exit(1)
})

//config
dotenv.config({ path: path.join(__dirname, 'config', 'config.env') })
connectDatabase();

const server = app.listen(process.env.PORT, () => {
  console.log(`Listening on ${process.env.PORT}`);
})


//unhandled promise rejection
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  console.log('shutting down server....');
  server.close(() => {
    process.exit(1);
  });
})