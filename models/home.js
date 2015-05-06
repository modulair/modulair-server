var mongoose = require('mongoose');

//Schema definition
var homeSchema = new mongoose.Schema({
  identity: {
    name: String
  },
  owner_id: String,
  owner_identity: {
    username: String,
    email: String,
    fullname: String,
    age: Number,
    location: String,
    gender: String
  },
  updated: {type:Date, default:Date.now},
  systems: []
});

//Export the model
module.exports = mongoose.model('Home', homeSchema);
