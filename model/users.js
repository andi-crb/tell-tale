var mongoose = require('mongoose');
var userSchema = new mongoose.Schema({
  username: String,
  displayname: String
})
mongoose.model('User', userSchema)