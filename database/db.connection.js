const mongoose = require('mongoose')

const MONGOURI = process.env['MONGODB']

// Connecting to database

const initialiseDatabase = async () => {
  try {
    const connection = await mongoose.connect(MONGOURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    if (connection) {
      console.log('Connected to MongoDb')
    }
  } catch (error) {
    console.log('Connection failed', error)
  }
}

module.exports = { initialiseDatabase }