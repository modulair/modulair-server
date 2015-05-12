var config = require('../config');
var mongo = require('mongoskin');
var params = require("../node_modules/swagger-node-express/lib/paramTypes");
var errorHandling = require('../node_modules/swagger-node-express/lib/errorHandling').error;
var async = require('async');
var BSON = mongo.BSONPure;


var io = require('socket.io-client')(config.routes.api);
var channel = '/system'
var emit = function(data) {
  io.emit(channel, data);
}
emit({title: 'connect'});

exports.getAll = {
  'spec': {
    "description" : "Operations about systems",
    "path" : "/systems/all",
    "notes" : "Returns all systems",
    "summary" : "Fetch all systems",
    "method": "GET",
    "nickname" : "getAllSystem"
  },
  'action': function (req,res) {
    console.log(req.db);
    var db = mongo.db("mongodb://localhost:27017/scratch-test", {native_parser:true});
    db.collection('systemcollection').find().toArray(function (err, items) {
      if (items!=[]) {
        res.json({result: items});
      } else {
        res.send(errorHandling.error(404, 'not found'));
      }
    });
  }
};


exports.addOne = {
  'spec': {
    "path" : "/systems/add",
    "notes" : "Add one system",
    "summary" : "Add one system",
    "method": "POST",
    "parameters" : [
      params.query("name", "name of NEW system", "string", true),
      params.query("home_id", "home ID of NEW system", "string", true)
      ],
    "responseClass": "",
    "errorResponses": [],
    "nickname" : "addOneSystem"
  },
  'action': function (req,res) {
    var newName = req.query.name || req.body.name || '';
    var newHomeID = req.query.home_id || req.body.home_id || '';
    var systemToAdd;
    var homeRes;
    var db = mongo.db("mongodb://localhost:27017/scratch-test", {native_parser:true});

    async.series([
      function (callback) {
      // check if string is ObjectID
        if (/^[0-9A-Fa-f]{24}$/.test(newHomeID)) {
          callback(null);
        } else {
          callback(400);
        }
      },
      function (callback) {
        db.collection('homecollection').find({_id:BSON.ObjectID(newHomeID)}).toArray(function (err, items) {
          if (!err) {
            // console.log(items);
            homeRes = items;
            if (homeRes.length <= 0) {
              callback(404);
            } else {
              if (homeRes.length > 1) {
                callback(400);
              } else {
                //only 1 user found
                callback(null);
              }
            }
          } else {
            callback(400);
          }
        });
      },
      function (callback) {
        if (newName!=null) {
          systemToAdd = {
            "identity": {
              "name": newName
            },
            "home_id": homeRes[0]._id,
            "home_identity": homeRes[0].identity,
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
        db.collection('systemcollection').insert(systemToAdd, function(err, result) {
          if (!err) {
            db.collection('homecollection').update({_id:BSON.ObjectID(newHomeID)}, {$push: {systems: {system_id: result[0]._id, system_name:result[0].identity.name}}, $set: {updated: Date.now()}}, function (err) {
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
        res.status(200).send(JSON.stringify("OK"));
      }
    });

    // if (newUsername && newHomeID) {
    //   var db = mongo.db("mongodb://localhost:27017/scratch-test", {native_parser:true});
    //   var systemToAdd = {
    //     "name": newName,
    //     "home_id": newHomeID
    //   }
    //
    //   db.collection('systemcollection').insert(systemToAdd, function(err, result) {
    //     res.send(
    //       (err === null) ? systemToAdd : {
    //         msg: err
    //       }
    //     );
    //   });
    // } else {
    //   res.send(JSON.stringify("Cannot do that."))
    // }
  }
};


//DELETE
exports.deleteOneById = {
  'spec': {
    "path" : "/systems/id/{system_id}",
    "notes" : "Deletes one system",
    "summary" : "Deletes one system by ID",
    "method": "DELETE",
    "parameters" : [
      params.path("system_id", "system ID to delete", "string"),
      params.query("owner_id", "owner ID of NEW home", "string", true)
      ],
    "nickname" : "deleteOneByIdSystem"
  },
  'action': function (req,res) {
    var system_id = req.params.system_id || req.query.system_id;
    var owner_id = req.params.owner_id || req.query.owner_id;
    var db = mongo.db("mongodb://localhost:27017/scratch-test", {native_parser:true});

    var systemRes;
    var homeRes;
    var userRes;
    var systemsArray;
    var home_id;
    async.series([
      function (callback) {
      // check if string is ObjectID
      console.log('1.ObjectID Testing');
        if (/^[0-9a-f]{24}$/.test(system_id) && /^[0-9a-f]{24}$/.test(owner_id)) {
          callback(null);
        } else {
          callback(400);
        }
      },
      function (callback) {
      console.log('2.Fetching User');
        db.collection('usercollection').find({_id:BSON.ObjectID(owner_id)}).toArray(function (err, items) {
          if (!err) {
            // console.log(items);
            userRes = items;
            console.log(userRes);
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
      console.log('3.Fetching System');
        db.collection('systemcollection').find({_id:BSON.ObjectID(system_id)}).toArray(function (err, items) {
          if (!err) {
            // console.log(items);
            systemRes = items;
            console.log(systemRes);
            if (systemRes.length<=0) {
              callback(404);
            } else if (systemRes.length > 1) {
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
      console.log('4.Testing Home');
        if (userRes[0].homes.length <= 0) {
          callback(404);
        } else {
          console.log(userRes[0].homes);
          for (var i = 0; i < userRes[0].homes.length; i++) {
            console.log(userRes[0].homes[i].home_id);
            console.log(systemRes[0].home_id);
            console.log(String(userRes[0].homes[i].home_id).length);
            console.log(String(systemRes[0].home_id).length);
            console.log(String(userRes[0].homes[i].home_id) == String(systemRes[0].home_id));
            // homey_id = userRes[0].homes[i].home_id;
            // console.log(homey_id);
            // console.log(homey_id == userRes[0].homes[i].home_id);
            // console.log(homey_id == systemRes[0].home_id);
            //
            // console.log(homez_id);
            // console.log(homez_id == homey_id);
            // console.log(new String(systemRes[0].home_id) == new String(userRes[0].homes[i].home_id));
            // console.log(new String(systemRes[0].home_id) === new String(userRes[0].homes[i].home_id));
            if (String(userRes[0].homes[i].home_id) == String(systemRes[0].home_id)) {
              console.log('same');
              home_id = systemRes[0].home_id;
              callback(null);
            } else if (i >= userRes[0].homes.length) {
              callback(404);
            }
          }
        }
      },
      function (callback) {
      console.log('5.Fetching Home');
        db.collection('homecollection').find({_id:BSON.ObjectID(home_id)}).toArray(function (err, items) {
          if (!err) {
            // console.log(items);
            homeRes = items;
            console.log(items);
            if (systemRes.length<=0) {
              callback(404);
            } else if (systemRes.length > 1) {
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
      console.log('6.Splicing System');
        if (homeRes[0].systems.length <= 0) {
          callback(404);
        } else {
          for (var i = 0; i < homeRes[0].systems.length; i++) {
            if (homeRes[0].systems[i].system_id == system_id) {
              homeRes[0].systems.splice(i,1);
              systemsArray = homeRes[0].systems;
              console.log(systemsArray);
              callback(null);
            } else if (i >= homeRes[0].systems.length) {
              callback(404);
            }
          }
        }
      },
      function (callback) {
      console.log('7.System Removal');
        db.collection('systemcollection').remove({_id:BSON.ObjectID(system_id)}, function (err, items) {
          if (!err) {
            db.collection('homecollection').update({_id:BSON.ObjectID(home_id)}, {$set: {systems: systemsArray, updated:Date.now()}}, function (err) {
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
        res.status(200).send(JSON.stringify("System has been successfully deleted.", null, 3));
      }
    });
  }
};
