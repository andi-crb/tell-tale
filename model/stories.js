var mongoose = require('mongoose');
var storySchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String
})
mongoose.model('Story', storySchema)