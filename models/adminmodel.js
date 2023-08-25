const mongoose = require('mongoose');
var id=new mongoose.Types.ObjectId();
const userData = new mongoose.Schema({
  name:String,
  email: String,
  password: String,
  is_admin: Number
});

const User = mongoose.model('admin', userData);

module.exports = User;
