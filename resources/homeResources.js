var mongo = require('mongoskin');
var params = require("../node_modules/swagger-node-express/lib/paramTypes");
var errorHandling = require('../node_modules/swagger-node-express/lib/errorHandling').error;
var async = require('async');

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
      params.query("user_id", "user ID of NEW home", "string", true)
      ],
    "responseClass": "",
    "errorResponses": [],
    "nickname" : "addOneHome"
  },
  'action': function (req,res) {
    var newName = req.query.name;
    var newUserID = req.query.user_id;
    var homeToAdd = {
      "name": newName,
      "user_id": newUserID
    }
    async.series([
      function(callback){
        // do some stuff ...
        var db = mongo.db("mongodb://localhost:27017/scratch-test", {native_parser:true});
        db.collection('usercollection').find({_id: BSON.ObjectID(newUserID)}).toArray(function (err, result) {
          console.log(result[0]);
          console.log('series 1');
          callback(404);
        });
      },
      function(callback){
        // do some more stuff ...
        console.log('series 2');
        callback(null);
      }
    ],
    // optional callback
    function(err, results){
        // results is now equal to ['one', 'two']
      switch(err) {
        case null:
          res.send(JSON.stringify("test is ok"));
          break;
        case 404:
          res.status(err).send(errorHandling(err, "no message"));
          break;
        default:        
          res.send(JSON.stringify("test is ok"));
      }
    });



    // if (newName && newUserID) {
    //   var db = mongo.db("mongodb://localhost:27017/scratch-test", {native_parser:true});

    //   db.collection('usercollection').find({_id: newUserID}).toArray(function (err, result) {
    //     console.log(result[0]);
    //   });


    // } else {
    //   res.send(JSON.stringify("Cannot do that."))
    // }
  }
};