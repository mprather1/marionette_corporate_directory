var mongoose = require("mongoose");
var mongoosePaginate = require('mongoose-paginate');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  firstName: String,
  lastName: String,
  phone: String,
  email: String,
  phone_sort_id: String
});

UserSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('User', UserSchema);
