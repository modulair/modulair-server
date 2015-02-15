var mongo = require('mongoskin');
var params = require("../node_modules/swagger-node-express/lib/paramTypes");
var errorHandling = require('../node_modules/swagger-node-express/lib/errorHandling');

exports.getAll = {
  'spec': {
    "description" : "Operations about home",
    "path" : "/homes/all",
    "notes" : "Returns all user",
    "summary" : "Fetch all homes",
    "method": "GET",
    "nickname" : "getAllHome"
  },
  'action': function (req,res) {
    var db = mongo.db("mongodb://localhost:27017/scratch-test", {native_parser:true});
    db.collection('homecollection').find().toArray(function (err, items) {
        res.json(items);
    });
  }
};