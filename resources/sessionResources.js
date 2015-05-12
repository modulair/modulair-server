var config = require('../config');
var mongo = require('mongoskin');
var params = require("../node_modules/swagger-node-express/lib/paramTypes");
var errorHandling = require('../node_modules/swagger-node-express/lib/errorHandling').error;
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
