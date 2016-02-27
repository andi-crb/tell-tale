var mongoose = require('mongoose');
var reviewSchema = new mongoose.Schema({
  reviewuser: String,
  reviewstory: String,
  status: String,
  rating: Number
  dateadded: Date,
  dateread: Date
})
mongoose.model('Review', reviewSchema)