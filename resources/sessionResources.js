var config = require('../config');
var mongo = require('mongoskin');
var params = require('../drivers').params;
var errorHandling = require('../drivers').errorHandler;
var BSON = mongo.BSONPure;
var async = require('async');


var io = require('socket.io-client')(config.routes.api);
var channel = '/session'
var emit = function(data) {
  io.emit(channel, data);
}
emit({title: 'connect'});

//GET
exports.getAll = {
  'spec': {
    path : "/sessions/all",
    notes : "Returns all sessions",
    summary : "Returns all sessions",
    method: "GET",
    nickname : "getAllSession",
    produces : ["application/json"]
  },
  'action': function (req,res) {
    var db = mongo.db("mongodb://localhost:27017/scratch-test", {native_parser:true});
    db.collection('sessioncollection').find().toArray(function (err, items) {
      emit('session get all');
      res.status(200).send(JSON.stringify({result: items}, null, 3));
    });
  }
};


//POST
exports.login = {
  'spec': {
    "path" : "/sessions/login",
    "notes" : "Login",
    "summary" : "Login",
    "method": "POST",
    "parameters" : [
      params.query("username", "username for login", "string", true),
      params.query("password", "password for login", "string", true)
      ],
    "responseClass": "",
    "errorResponses": [],
    "nickname" : "loginSession"
  },
  'action': function (req,res) {
    //TODO: use hashing for password.

    var db = mongo.db("mongodb://localhost:27017/scratch-test", {native_parser:true});
    var username = req.query.username || req.body.username || '';
    var password = req.query.password || req.body.password || '';

    var userRes;
    var sessionRes;
    var usernameBool=false;

    //ASYNC
    async.series([
      function (callback) {
        db.collection('usercollection').findOne({'identity.username':username}, function (err, items) {

          if (!err && items) {
            userRes = items;
            usernameBool = true;
            if (items.identity.password==password) {
              callback(null);
            } else {
              callback(400);
            }
          } else {
            callback(null);
          }
        });
      },
      function (callback) {
        if (!usernameBool) {
          db.collection('usercollection').findOne({'identity.email':username}, function (err, items) {
            if (!err && items) {
              userRes = items;
              if (items.identity.password==password) {
                callback(null);
              } else {
                callback(400);
              }
            } else {
              callback(404);
            }
          });
        } else {
          callback(null);
        }
      },
      function (callback) {
        var sessionToAdd = {user: {
                              _id: userRes._id
                            },
                            timestamp: Date.now(),
                            expires: (Date.now() + 3600000)}
        db.collection('sessioncollection').insert(sessionToAdd, function(err, result) {
          if (err === null) {
              console.log(result);
              sessionRes = sessionToAdd;
              callback(null);
            } else {
              callback(500);
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
              res.status(500).send(JSON.stringify({error:"Unknown error."}));
              break;
          }
        } else {
          res.status(200).send(JSON.stringify({session: sessionRes}),null, 3);
        }
      }
    );
  }
};

//DELETE
exports.deleteOneById = {
  'spec': {
    "path" : "/sessions/id/{session_id}",
    "notes" : "Deletes one session",
    "summary" : "Deletes one session by ID",
    "method": "DELETE",
    "parameters" : [
      params.path("session_id", "session ID of user", "string")
      ],
    "nickname" : "deleteOneByIdSession"
  },
  'action': function (req,res) {
    var session_id = req.params.session_id || req.query.session_id;
    var db = mongo.db("mongodb://localhost:27017/scratch-test", {native_parser:true});
    var sessionRes;
    async.series([
      function (callback) {
      // check if string is ObjectID
        if (/^[0-9a-f]{24}$/.test(session_id)) {
          callback(null);
        } else {
          callback(400);
        }
      },
      function (callback) {
        db.collection('sessioncollection').find({_id:BSON.ObjectID(session_id)}).toArray(function (err, items) {
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
        db.collection('sessioncollection').remove({_id:BSON.ObjectID(session_id)}, function (err, items) {
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
        res.status(200).send(JSON.stringify({result: "success", message: "session has been deleted"}, null, 3));
      }
    });
  }
};
