var mongo = require('mongoskin');
var params = require("../node_modules/swagger-node-express/lib/paramTypes");
var errorHandling = require('../node_modules/swagger-node-express/lib/errorHandling').error;
var async = require('async');
var BSON = mongo.BSONPure;

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
            "owner_id": newOwnerID
          }
          callback(null);
        } else {
          callback(400);
        }
      },
      function (callback) {
        db.collection('homecollection').insert(homeToAdd, function(err, result) {
          if (!err) {
            callback(null);
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
        res.status(200).json(homeToAdd);
      }
    });
    // async.series([
    //   function(callback){
    //     // do some stuff ...
    //     var db = mongo.db("mongodb://localhost:27017/scratch-test", {native_parser:true});
    //     db.collection('usercollection').find({_id: BSON.ObjectID(newUserID)}).toArray(function (err, result) {
    //       console.log(result[0]);
    //       console.log('series 1');
    //       callback(404);
    //     });
    //   },
    //   function(callback){
    //     // do some more stuff ...
    //     console.log('series 2');
    //     callback(null);
    //   }
    // ],
    // // optional callback
    // function(err, results){
    //     // results is now equal to ['one', 'two']
    //   switch(err) {
    //     case null:
    //       res.send(JSON.stringify("test is ok"));
    //       break;
    //     case 404:
    //       res.status(err).send(errorHandling(err, "no message"));
    //       break;
    //     default:        
    //       res.send(JSON.stringify("test is ok"));
    //   }
    // });



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