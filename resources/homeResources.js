var mongo = require('mongoskin');
var params = require("../node_modules/swagger-node-express/lib/paramTypes");
var errorHandling = require('../node_modules/swagger-node-express/lib/errorHandling');

exports.getAll = {
  'spec': {
    "description" : "Operations about home",
    "path" : "/homes/all",
    "notes" : "Returns all homes",
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

exports.addOne = {
  'spec': {
    "description" : "Operations about homes",
    "path" : "/homes/add",
    "notes" : "Add one home",
    "summary" : "Add one home",
    "method": "POST",
    "parameters" : [
      params.query("name", "name of NEW home", "string", true),
      params.query("user_id", "user ID of NEW home", "ObjectID", true)
      ],
    "responseClass": "",
    "errorResponses": [],
    "nickname" : "addOneHome"
  },
  'action': function (req,res) {
    var newName = req.query.name || req.body.name || '';
    var newUserID = req.query.user_id || req.body.user_id || '';
    if (newName && newUserID) {
      var db = mongo.db("mongodb://localhost:27017/scratch-test", {native_parser:true});
      var homeToAdd = {
        "name": newName,
        "user_id": newUserID
      }
      db.collection('usercollection').find({_id: newUserID}).toArray(function (err, result) {
        console.log(result[0]);
      });

      db.collection('homecollection').insert(homeToAdd, function(err, result) {
        res.send(
          
          (err === null) ? homeToAdd : {
            msg: err
          }
        );
      });
    } else {
      res.send(JSON.stringify("Cannot do that."))
    }
  }
};