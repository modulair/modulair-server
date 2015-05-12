var config = require('../config');
var mongo = require('mongoskin');
var params = require("../node_modules/swagger-node-express/lib/paramTypes");
var errorHandling = require('../node_modules/swagger-node-express/lib/errorHandling').error;
var BSON = mongo.BSONPure;
var async = require('async');


var io = require('socket.io-client')(config.routes.api);
var channel = '/user'
var emit = function(data) {
  io.emit(channel, data);
}
emit({title: 'connect'});

//GET
exports.getAll = {
  'spec': {
    path : "/users/all",
    notes : "Returns all user",
    summary : "Returns all user",
    method: "GET",
    nickname : "getAllUser",
    produces : ["application/json"]
  },
  'action': function (req,res) {
    var db = mongo.db("mongodb://localhost:27017/scratch-test", {native_parser:true});
    db.collection('usercollection').find().toArray(function (err, items) {
      emit('user get all');
      res.status(200).send(JSON.stringify({result: items}, null, 3));
    });
  }
};

exports.getOneById = {
  'spec': {
    "path" : "/users/id/{user_id}",
    "notes" : "Returns one user",
    "summary" : "Returns one user by ID",
    "method": "GET",
    "parameters" : [
      params.path("user_id", "user ID of user", "string")
      ],
    "nickname" : "getOneByIdUser"
  },
  'action': function (req,res) {
    var user_id = req.params.user_id || req.query.user_id;
    var db = mongo.db("mongodb://localhost:27017/scratch-test", {native_parser:true});
    var userRes;
    async.series([
      function (callback) {
      // check if string is ObjectID
        if (/^[0-9a-f]{24}$/.test(user_id)) {
          callback(null);
        } else {
          callback(400);
        }
      },
      function (callback) {
        db.collection('usercollection').find({_id:BSON.ObjectID(user_id)}).toArray(function (err, items) {
          if (!err) {
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
            callback(null);
          }
        }
      }
    ],
    // optional callback
    function (err, results) {
      if (err) {
        switch(err) {
          case 400:
            message = errorHandling(err, "Bad request.");
            res.status(err).send(JSON.stringify(message, null, 3));
            break;
          case 404:
            message = errorHandling(err, "Not found.");
            res.status(err).send(JSON.stringify(message, null, 3));
            break;
          default:
            message = errorHandling(err, "Unknown error.");
            res.status(500).send(JSON.stringify(message, null, 3));
            break;
        }
      } else {
        res.status(200).send(JSON.stringify(userRes[0], null, 3));
      }
    });
  }
};

//POST
exports.addOne = {
  'spec': {
    "path" : "/users/add",
    "notes" : "Add one user",
    "summary" : "Add one user",
    "method": "POST",
    "parameters" : [
      params.query("username", "username of NEW user", "string", true),
      params.query("email", "email of NEW user", "string", true),
      params.query("fullname", "fullname of NEW user", "string", true),
      params.query("password", "password of NEW user", "string", true)
      ],
    "responseClass": "",
    "errorResponses": [],
    "nickname" : "addOneUser"
  },
  'action': function (req,res) {
    //TODO: use hashing for password.

    var newUsername = req.query.username || req.body.username || '';
    var newEmail = req.query.email || req.body.email || '';
    var newFullname = req.query.fullname || req.body.fullname || '';
    var newPassword = req.query.password || req.body.password || undefined;

    if (newUsername && newEmail && newFullname && newPassword) {
      var db = mongo.db("mongodb://localhost:27017/scratch-test", {native_parser:true});
      var userToAdd = {
        "identity": {
          "username": newUsername,
          "email": newEmail,
          "fullname": newFullname,
          "password": newPassword
        },
        "created": Date.now(),
        "updated": Date.now()
      }
      db.collection('usercollection').insert(userToAdd, function(err, result) {
        if (err === null) {
            res.status(200).send(JSON.stringify(userToAdd, null, 3));
          } else {
            message = errorHandling(500, "unknown error");
            res.status(500).send(JSON.stringify(message, null, 3));
          }
      });
    } else {
            message = errorHandling(400, "Bad request.");
            res.status(400).send(JSON.stringify(message, null, 3));
    }
  }
};

//PUT


//DELETE
exports.deleteOneById = {
  'spec': {
    "path" : "/users/id/{user_id}",
    "notes" : "Deletes one user",
    "summary" : "Deletes one user by ID",
    "method": "DELETE",
    "parameters" : [
      params.path("user_id", "user ID of user", "string")
      ],
    "nickname" : "deleteOneByIdUser"
  },
  'action': function (req,res) {
    var user_id = req.params.user_id || req.query.user_id;
    var db = mongo.db("mongodb://localhost:27017/scratch-test", {native_parser:true});
    var userRes;
    async.series([
      function (callback) {
      // check if string is ObjectID
        if (/^[0-9a-f]{24}$/.test(user_id)) {
          callback(null);
        } else {
          callback(400);
        }
      },
      function (callback) {
        db.collection('usercollection').find({_id:BSON.ObjectID(user_id)}).toArray(function (err, items) {
        //stash the user data
          if (!err) {
            if (items.length<=0) {
              callback(404);
            } else if (items.length > 1) {
              callback(400);
            } else {
              userRes = items[0];
              callback(null);
            }
          } else {
            callback(400);
          }
        });
      },
      function (callback) {
      //delete the particular user
        db.collection('usercollection').remove({_id:BSON.ObjectID(user_id)}, function (err, items) {
          if (!err) {
            callback(null);
          } else {
            callback(400);
          }
        });
      },
      function (callback) {
      //delete the homes associated
        if (!userRes.homes) {
          callback(null);
        } else {
          if (userRes.homes.length <= 1) {
            callback(null);
          }
          for (var i = 0; i < userRes.homes.length; i++) {
            db.collection('homecollection').remove({_id:BSON.ObjectID(userRes.homes[i].home_id)}, function (err, items) {
              if (err) {
                callback(400);
              }
            });
          }
          callback(null);
        }
      }
    ],
    // optional callback
    function (err, results) {
      if (err) {
        switch(err) {
          case 400:
            message = errorHandling(err, "Bad request.");
            res.status(err).send(JSON.stringify(message, null, 3));
            break;
          case 404:
            message = errorHandling(err, "Not found.");
            res.status(err).send(JSON.stringify(message, null, 3));
            break;
          default:
            message = errorHandling(err, "Unknown error.");
            res.status(500).send(JSON.stringify(message, null, 3));
            break;
        }
      } else {
        res.status(200).send(JSON.stringify("User has been successfully deleted.", null, 3));
      }
    });
  }
};
