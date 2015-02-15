var mongo = require('mongoskin');
var params = require("../node_modules/swagger-node-express/lib/paramTypes");
var errorHandling = require('../node_modules/swagger-node-express/lib/errorHandling');

exports.getAll = {
  'spec': {
    "description" : "Operations about user",
    "path" : "/users/all",
    "notes" : "Returns all user",
    "summary" : "Find pet by ID",
    "method": "GET",
    "type" : "Pet",
    "nickname" : "getAll"
  },
  'action': function (req,res) {
    console.log(req.db);
    var db = mongo.db("mongodb://localhost:27017/scratch-test", {native_parser:true});
    db.collection('usercollection').find().toArray(function (err, items) {
        res.json(items);
    });
  }
};

exports.addUser = {
  'spec': {
    "description" : "Operations about user",
    "path" : "/users/add",
    "notes" : "Add user",
    "summary" : "Add user",
    "method": "POST",
    "parameters" : [
      params.query("username", "username of NEW user", "string", true),
      params.query("email", "email of NEW user", "string", true),
      params.query("fullname", "fullname of NEW user", "string", true),
      params.query("age", "age of NEW user", "int", true),
      params.query("location", "location of NEW user", "string", true),
      params.query("gender", "gender of NEW user", "string", true),
      ],
    "responseClass": "",
    "errorResponses": [],
    "nickname" : "addUser"
  },
  'action': function (req,res) {
    // var db = mongo.db("mongodb://localhost:27017/scratch-test", {
    //   native_parser: true
    // });http://swagger.io/
    // db.collection('usercollection').insert(req.body, function(err, result) {
    //   res.send(
    //     (err === null) ? {
    //       msg: ''
    //     } : {
    //       msg: err
    //     }
    //   );
    // });
    var newUsername = req.query.username || req.body.username || '';
    var newEmail = req.query.email || req.body.email || '';
    var newFullname = req.query.fullname || req.body.fullname || '';
    var newAge = req.query.age || req.body.age || undefined;
    var newLocation = req.query.location || req.body.location || '';
    var newGender = req.query.gender || req.body.gender || '';
    console.log('database: ' + req.db);
    if (newUsername && newEmail && newFullname && newAge && newLocation && newGender) {
      var db = mongo.db("mongodb://localhost:27017/scratch-test", {native_parser:true});
      var userToAdd = {
        "username": newUsername,
        "email": newEmail,
        "fullname": newFullname,
        "age": newAge,
        "location": newLocation,
        "gender": newGender
      }
      db.collection('usercollection').insert(userToAdd, function(err, result) {
        res.send(
          (err === null) ? {
            msg: 'successfully added user ' + newUsername
          } : {
            msg: err
          }
        );
      });
    } else {
      res.send(JSON.stringify("Cannot do that."))
    }
  }
};

// exports.findById = {
//   'spec': {
//     "description" : "Operations about pets",
//     "path" : "/pet.{format}/{petId}",
//     "notes" : "Returns a pet based on ID",
//     "summary" : "Find pet by ID",
//     "method": "GET",
//     "parameters" : [
//       param.path("username", "NEW username", "string"),
//       param.path("email", "NEW email", "string"),
//       param.path("fullname", "NEW fullname", "string"),
//       param.path("age", "NEW age", "string"),
//       param.path("location", "NEW location", "string"),
//       param.path("gender", "NEW gender", "string"),

//       ],
//     "type" : "Pet",
//     "nickname" : "getPetById"
//   },
//   'action': function (req,res) {

//   //   { username: 'a',
//   // email: 's',
//   // fullname: 'd',
//   // age: '2',
//   // location: 'f',
//   // gender: 'g' }


//   }
// };