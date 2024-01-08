const mongoose = require('mongoose')


const destinationSchema = mongoose.Schema({
  destinationName: {type: String, required:true, unique:true},
  location: {type: String, required:true},
  description:  {type: String, required:true},
  rating: {type:Number, min:0, max:5, default: 0},
  userAverageRating: {type:Number, min:0, max:5, default: 0},
  reviews: [{
    user: {
      type:mongoose.Schema.Types.ObjectId,
      ref:'User'
    },
    text: String,
    userRating: Number
  }]
}, {timestamps:true})

const Destination = mongoose.model('Destination', destinationSchema)

module.exports = {Destination}