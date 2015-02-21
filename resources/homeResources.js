var mongo = require('mongoskin');
var params = require("../node_modules/swagger-node-express/lib/paramTypes");
var errorHandling = require('../node_modules/swagger-node-express/lib/errorHandling').error;
var async = require('async');
var BSON = mongo.BSONPure;

exports.getAll = {
  'spec': {
    "path" : "/homes/all",
    "notes" : "Returns all homes",
    "summary" : "Fetch all homes",
    "method": "GET",
    "nickname" : "getAllHome"
  },
  'action': function (req,res) {
    var db = mongo.db("mongodb://localhost:27017/scratch-test", {native_parser:true});
    db.collection('homecollection').find().toArray(function (err, items) {
        res.send(JSON.stringify(items, null, 3));
    });
  }
};

exports.addOne = {
  'spec': {
    "path" : "/homes/add",
    "notes" : "Add one home",
    "summary" : "Add one home",
    "method": "POST",
    "parameters" : [
      params.query("name", "name of NEW home", "string", true),
      params.query("owner_id", "owner ID of NEW home", "string", true)
      ],
    "responseClass": "",
    "errorResponses": [],
    "nickname" : "addOneHome"
  },
  'action': function (req,res) {
    var newName = req.query.name;
    var newOwnerID = req.query.owner_id;
    var homeToAdd;
    var userRes;
    var db = mongo.db("mongodb://localhost:27017/scratch-test", {native_parser:true});
    async.series([
      function (callback) {
      // check if string is ObjectID
        if (/^[0-9A-Fa-f]{24}$/.test(newOwnerID)) {
          callback(null);
        } else {
          callback(400);
        }
      },
      function (callback) {
        db.collection('usercollection').find({_id:BSON.ObjectID(newOwnerID)}).toArray(function (err, items) {
          if (!err) {
            // console.log(items);
            userRes = items;
            callback(null);
          } else {
            callback(400);
          }
        });
      },
      function (callback) {
        if (userRes.length <= 0) {
          callback(404);
        } else {
          if (userRes.length > 1) {
            callback(400);
          } else {
            //only 1 user found
            callback(null);
          }
        }
      },
      function (callback) {
        if (newName!=null) {
          homeToAdd = {
            "name": newName,
            "owner": {
              "_id": userRes[0]._id,
              "username": userRes[0].username,
              "email": userRes[0].email,
              "fullname": userRes[0].fullname,
              "age": userRes[0].age,
              "location": userRes[0].location,
              "gender": userRes[0].gender
            }
          }
          callback(null);
        } else {
          callback(400);
        }
      },
      function (callback) {
      //INCEPTION
        db.collection('homecollection').insert(homeToAdd, function(err, result) {
          if (!err) {
            console.log(result);
            db.collection('usercollection').update({_id:BSON.ObjectID(newOwnerID)}, {$push: {homes: result[0]._id}}, function (err) {
              if (!err) {
                callback(null);
              } else {
                callback(400);
              }
            });
          } else {
            callback(400);
          }
        });
      }
    ],
    // optional callback
    function (err, results) {
      if (err) {
        switch(err) {
          case 400:
            res.status(err).send(errorHandling(err, "Bad request."));
            break;
          case 404:
            res.status(err).send(errorHandling(err, "Not found."));
            break;
          default:        
            res.status(500).send(JSON.stringify("Unknown error."));
            break;
        }
      } else {
        res.status(200).send(JSON.stringify(homeToAdd, null, 3));
      }
    });
  }
};