var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  firstName: String,
  lastName: String,
  phone: String,
  email: String,
  phone_sort_id: String
});

module.exports = mongoose.model('User', UserSchema);
