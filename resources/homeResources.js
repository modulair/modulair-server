var config = require('../config');
var mongo = require('mongoskin');
var params = require("../node_modules/swagger-node-express/lib/paramTypes");
var errorHandling = require('../node_modules/swagger-node-express/lib/errorHandling').error;
var async = require('async');
var BSON = mongo.BSONPure;

var mongoose = require('mongoose');
var Home = require('../models/home');


var io = require('socket.io-client')(config.routes.api);
var channel = '/home'
var emit = function(data) {
  io.emit(channel, data);
}
emit({title: 'connect'});

//GET
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
      emit({title: 'getAll', content: 'get all called.', timestamp: Date.now()});
      res.status(200).send(JSON.stringify({result: items}, null, 3));
    });
  }
};

exports.getOneById = {
  'spec': {
    "path" : "/homes/id/{home_id}",
    "notes" : "Returns one home",
    "summary" : "Returns one home by ID",
    "method": "GET",
    "parameters" : [
      params.path("home_id", "home ID to get", "string")
      ],
    "nickname" : "getOneByIdHome"
  },
  'action': function (req,res) {
    var home_id = req.params.home_id || req.query.home_id;
    var db = mongo.db("mongodb://localhost:27017/scratch-test", {native_parser:true});
    var homeRes;
    async.series([
      function (callback) {
      // check if string is ObjectID
        if (/^[0-9a-f]{24}$/.test(home_id)) {
          callback(null);
        } else {
          callback(400);
        }
      },
      function (callback) {
        db.collection('homecollection').find({_id:BSON.ObjectID(home_id)}).toArray(function (err, items) {
          if (!err) {
            homeRes = items;
            callback(null);
          } else {
            callback(400);
          }
        });
      },
      function (callback) {
        if (homeRes.length <= 0) {
          callback(404);
        } else {
          if (homeRes.length > 1) {
            callback(400);
          } else {
            callback(null);
          }
        }
      }
    ],
    // optional callback
    function (err, results) {
      // io.emit('getone',{content: 'get one by id called', timestamp: Date.now()});

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
        emit({title: 'getOneById', content: 'get one by id called.', timestamp: Date.now(), home_id: homeRes[0]._id});
        res.status(200).send(JSON.stringify(homeRes[0], null, 3));
      }
    });
  }
};

//POST
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
            "identity": {
              "name": newName
            },
            "owner_id": userRes[0]._id,
            "owner_identity": userRes[0].identity,
            "created": Date.now(),
            "updated": Date.now()
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
            db.collection('usercollection').update({_id:BSON.ObjectID(newOwnerID)}, {$push: {homes: {home_id: result[0]._id, home_name:result[0].identity.name}}, $set: {updated: Date.now()}}, function (err) {
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
exports.addOneMongoose = {
  'spec': {
    "path" : "/homes/addMongoose",
    "notes" : "Add one home Mongoose",
    "summary" : "Add one home Mongoose",
    "method": "POST",
    "parameters" : [
      params.query("name", "name of NEW home", "string", true),
      params.query("owner_id", "owner ID of NEW home", "string", true)
      ],
    "responseClass": "",
    "errorResponses": [],
    "nickname" : "addOneHomeMongoose"
  },
  'action': function (req,res) {
    var home = new Home();
    console.log(home);
    console.log(home._id);
    console.log(home.identity);
    home.identity.name = req.query.name;

    home.save(function (err) {
      if (err) {
        res.send(err);
      }
      res.json({ message: 'Home added to the db!', data: home });
    });
  }
};

//DELETE
exports.deleteOneById = {
  'spec': {
    "path" : "/homes/id/{home_id}",
    "notes" : "Deletes one home",
    "summary" : "Deletes one home by ID",
    "method": "DELETE",
    "parameters" : [
      params.path("home_id", "home ID to delete", "string"),
      params.query("owner_id", "owner ID of NEW home", "string", true)
      ],
    "nickname" : "deleteOneByIdHome"
  },
  'action': function (req,res) {
    var home_id = req.params.home_id || req.query.home_id;
    var owner_id = req.params.owner_id || req.query.owner_id;
    var db = mongo.db("mongodb://localhost:27017/scratch-test", {native_parser:true});

    var homeRes;
    var userRes;
    var homesArray;
    async.series([
      function (callback) {
      // check if string is ObjectID
        if (/^[0-9a-f]{24}$/.test(home_id) && /^[0-9a-f]{24}$/.test(owner_id)) {
          callback(null);
        } else {
          callback(400);
        }
      },
      function (callback) {
        db.collection('usercollection').find({_id:BSON.ObjectID(owner_id)}).toArray(function (err, items) {
          if (!err) {
            // console.log(items);
            userRes = items;
            console.log(items);
            if (userRes.length<=0) {
              callback(404);
            } else if (userRes.length > 1) {
              callback(400);
            } else {
              callback(null);
            }
          } else {
            callback(400);
          }
        });
      },
      function (callback) {
        if (userRes[0].homes.length <= 0) {
          callback(404);
        } else {
          for (var i = 0; i < userRes[0].homes.length; i++) {
            if (userRes[0].homes[i].home_id == home_id) {
              userRes[0].homes.splice(i,1);
              homesArray = userRes[0].homes;
              console.log(homesArray);
              callback(null);
            } else if (i >= userRes[0].homes.length) {
              callback(404);
            }
          }
        }
      },
      function (callback) {
        db.collection('homecollection').remove({_id:BSON.ObjectID(home_id)}, function (err, items) {
          if (!err) {
            db.collection('usercollection').update({_id:BSON.ObjectID(owner_id)}, {$set: {homes: homesArray, updated:Date.now()}}, function (err) {
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
        res.status(200).send(JSON.stringify("Home has been successfully deleted.", null, 3));
      }
    });
  }
};
