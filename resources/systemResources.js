var mongo = require('mongoskin');
var params = require("../node_modules/swagger-node-express/lib/paramTypes");
var errorHandling = require('../node_modules/swagger-node-express/lib/errorHandling');

exports.getAll = {
  'spec': {
    "description" : "Operations about systems",
    "path" : "/systems/all",
    "notes" : "Returns all systems",
    "summary" : "Fetch all systems",
    "method": "GET",
    "nickname" : "getAlSystem"
  },
  'action': function (req,res) {
    console.log(req.db);
    var db = mongo.db("mongodb://localhost:27017/scratch-test", {native_parser:true});
    db.collection('systemcollection').find().toArray(function (err, items) {
      if (items!=[]) {
        res.json(items);
      } else {
        res.send(errorHandling.error(404, 'not found'));
      }
    });
  }
};


exports.addOne = {
  'spec': {
    "description" : "Operations about systems",
    "path" : "/systems/add",
    "notes" : "Add one system",
    "summary" : "Add one system",
    "method": "POST",
    "parameters" : [
      params.query("name", "name of NEW system", "string", true),
      params.query("home_id", "home ID of NEW system", "ObjectID", true)
      ],
    "responseClass": "",
    "errorResponses": [],
    "nickname" : "addOneSystem"
  },
  'action': function (req,res) {
    var newName = req.query.name || req.body.name || '';
    var newHomeID = req.query.home_id || req.body.home_id || '';
    if (newUsername && newHomeID) {
      var db = mongo.db("mongodb://localhost:27017/scratch-test", {native_parser:true});
      var systemToAdd = {
        "name": newName,
        "home_id": newHomeID
      }
      
      db.collection('systemcollection').insert(systemToAdd, function(err, result) {
        res.send(
          (err === null) ? systemToAdd : {
            msg: err
          }
        );
      });
    } else {
      res.send(JSON.stringify("Cannot do that."))
    }
  }
};