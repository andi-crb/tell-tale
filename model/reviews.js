var mongoose = require('mongoose');
var reviewSchema = new mongoose.Schema({
  reviewuser: String,
  reviewstory: String,
  status: String,
  review: String,
  rating: Number,
  dateAdded: Date,
  dateread: Date
})
mongoose.model('Review', reviewSchema)