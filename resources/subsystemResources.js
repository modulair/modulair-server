var config = require('../config');
var mongo = require('mongoskin');
var params = require("../node_modules/swagger-node-express/lib/paramTypes");
var errorHandling = require('../node_modules/swagger-node-express/lib/errorHandling').error;
var async = require('async');
var BSON = mongo.BSONPure;

var io = require('socket.io-client')(config.routes.api);
var channel = '/subsystem'
var emit = function(data) {
  io.emit(channel, data);
}
emit({title: 'connect'});
//GET
exports.getAll = {
  'spec': {
    "description" : "Operations about subsystems",
    "path" : "/subsystems/all",
    "notes" : "Returns all subsystems",
    "summary" : "Fetch all subsystems",
    "method": "GET",
    "nickname" : "getAllSubsystem"
  },
  'action': function (req,res) {
    console.log(req.db);
    var db = mongo.db("mongodb://localhost:27017/scratch-test", {native_parser:true});
    db.collection('subsystemcollection').find().toArray(function (err, items) {
      if (items!=[]) {
        res.json({items: items});
      } else {
        res.send(errorHandling.error(404, 'not found'));
      }
    });
  }
};

exports.getOneById = {
  'spec': {
    "path" : "/subsystems/id/{subsystem_id}",
    "notes" : "Returns one subsystem",
    "summary" : "Returns one subsystem by ID",
    "method": "GET",
    "parameters" : [
      params.path("subsystem_id", "subsystem ID to get", "string")
      ],
    "nickname" : "getOneByIdSubsystem"
  },
  'action': function (req,res) {
    var subsystem_id = req.params.subsystem_id || req.query.subsystem_id;
    var db = mongo.db("mongodb://localhost:27017/scratch-test", {native_parser:true});
    var subsystemRes;
    async.series([
      function (callback) {
      // check if string is ObjectID
        if (/^[0-9a-f]{24}$/.test(subsystem_id)) {
          callback(null);
        } else {
          callback(400);
        }
      },
      function (callback) {
        db.collection('subsystemcollection').find({_id:BSON.ObjectID(subsystem_id)}).toArray(function (err, items) {
          if (!err) {
            subsystemRes = items;
            callback(null);
          } else {
            callback(400);
          }
        });
      },
      function (callback) {
        if (subsystemRes.length <= 0) {
          callback(404);
        } else {
          if (subsystemRes.length > 1) {
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
        // io.emit('getonecall', { content: 'get one by id called.', timestamp: Date.now(), home_id: homeRes[0]._id});
        res.status(200).send(JSON.stringify(subsystemRes[0], null, 3));
      }
    });
  }
};


//GET
exports.changeState = {
  'spec': {
    "description" : "Operations about subsystems",
    "path" : "/subsystems/state",
    "notes" : "changeState",
    "summary" : "changeState",
    "method": "GET",
    "nickname" : "changeStateSubsystem"
  },
  'action': function (req,res) {
    var db = mongo.db("mongodb://localhost:27017/scratch-test", {native_parser:true});
    db.collection('subsystemcollection').find().toArray(function (err, items) {
      if (items!=[]) {
        emit({title: 'changeState', headers: req.headers, ip: req.ip, cookies: req.cookies, timestamp: Date.now()});
        //console.log(req);
        res.json(items);
      } else {
        res.send(errorHandling.error(404, 'not found'));
      }
    });
  }
};
//PUT


//POST
exports.addOne = {
  'spec': {
    "path" : "/subsystems/add",
    "notes" : "Add one subsystem",
    "summary" : "Add one subsystem",
    "method": "POST",
    "parameters" : [
      params.query("name", "name of NEW subsystem", "string", true),
      params.query("interface", "interface of NEW subsystem", "string", true),
      params.query("system_id", "system ID of NEW subsystem", "string", true)
      ],
    "responseClass": "",
    "errorResponses": [],
    "nickname" : "addOneSubsystem"
  },
  'action': function (req,res) {
    var newName = req.query.name || req.body.name || '';
    var newInterface = req.query.interface || req.body.interface || '';
    var newSystemID = req.query.system_id || req.body.system_id || '';
    var subsystemToAdd;
    var systemRes;
    var db = mongo.db("mongodb://localhost:27017/scratch-test", {native_parser:true});

    async.series([
      function (callback) {
      // check if string is ObjectID
        if (/^[0-9A-Fa-f]{24}$/.test(newSystemID)) {
          callback(null);
        } else {
          callback(400);
        }
      },
      function (callback) {
        db.collection('systemcollection').find({_id:BSON.ObjectID(newSystemID)}).toArray(function (err, items) {
          if (!err) {
            // console.log(items);
            systemRes = items;
            console.log(systemRes);
            if (systemRes.length <= 0) {
              callback(404);
            } else {
              if (systemRes.length > 1) {
                callback(400);
              } else {
                //only 1 system found
                callback(null);
              }
            }
          } else {
            callback(400);
          }
        });
      },
      function (callback) {
        if (newName!=null && newName!=null) {
          subsystemToAdd = {
            "identity": {
              "name": newName
            },
            "interface": newInterface,
            "system_id": systemRes[0]._id,
            "system_identity": systemRes[0].identity,
            "state": {},
            "desired_state": {},
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
        db.collection('subsystemcollection').insert(subsystemToAdd, function(err, result) {
          if (!err) {
            db.collection('systemcollection').update({_id:BSON.ObjectID(newSystemID)}, {$push: {subsystems: {subsystem_id: result[0]._id, subsystem_name:result[0].identity.name}}, $set: {updated: Date.now()}}, function (err) {
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
  }
};


//DELETE
exports.deleteOneById = {
  'spec': {
    "path" : "/subsystems/id/{subsystem_id}",
    "notes" : "Deletes one subsystem",
    "summary" : "Deletes one subsystem by ID",
    "method": "DELETE",
    "parameters" : [
      params.path("subsystem_id", "subsystem ID to delete", "string"),
      params.query("owner_id", "owner ID of subsystem", "string", true)
      ],
    "nickname" : "deleteOneByIdSubsystem"
  },
  'action': function (req,res) {
    var subsystem_id = req.params.subsystem_id || req.query.subsystem_id;
    var owner_id = req.params.owner_id || req.query.owner_id;
    var db = mongo.db("mongodb://localhost:27017/scratch-test", {native_parser:true});

    var system_id;
    var subsystemRes;
    var systemRes;
    var homeRes;
    var userRes;
    var subsystemsArray;

    async.series([
      function (callback) {
      // check if string is ObjectID
      console.log('1.ObjectID Testing');
        if (/^[0-9a-f]{24}$/.test(subsystem_id) && /^[0-9a-f]{24}$/.test(owner_id)) {
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
      console.log('3.Fetching Subsystem');
        db.collection('subsystemcollection').find({_id:BSON.ObjectID(subsystem_id)}).toArray(function (err, items) {
          if (!err) {
            // console.log(items);
            subsystemRes = items;
            console.log(subsystemRes);
            if (subsystemRes.length<=0) {
              callback(404);
            } else if (subsystemRes.length > 1) {
              callback(400);
            } else {
              system_id = subsystemRes[0].system_id;
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
            if (String(userRes[0].homes[i].home_id) == String(systemRes[0].home_id)) {
              console.log('same');
              callback(null);
            } else if (i >= userRes[0].homes.length) {
              callback(404);
            }
          }
        }
      },
      function (callback) {
      console.log('6.Splicing System');
        if (systemRes[0].subsystems.length <= 0) {
          callback(404);
        } else {
          for (var i = 0; i < systemRes[0].subsystems.length; i++) {
            if (systemRes[0].subsystems[i].subsystem_id == subsystem_id) {
              systemRes[0].subsystems.splice(i,1);
              subsystemsArray = systemRes[0].subsystems;
              console.log(subsystemsArray);
              callback(null);
            } else if (i >= systemRes[0].subsystems.length) {
              callback(404);
            }
          }
        }
      },
      function (callback) {
      console.log('7.System Removal');
        db.collection('subsystemcollection').remove({_id:BSON.ObjectID(subsystem_id)}, function (err, items) {
          if (!err) {
            db.collection('systemcollection').update({_id:BSON.ObjectID(system_id)}, {$set: {subsystems: subsystemsArray, updated:Date.now()}}, function (err) {
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
        res.status(200).send(JSON.stringify("Subsystem has been successfully deleted.", null, 3));
      }
    });
  }
};
