var mongo = require('mongoskin');

var param = require("../node_modules/swagger-node-express/lib/paramTypes");

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
      param.query("username", "username of NEW user", "string", true),
      param.query("email", "email of NEW user", "string", true),
      param.query("fullname", "fullname of NEW user", "string", true),
      param.query("age", "age of NEW user", "int", true),
      param.query("location", "location of NEW user", "string", true),
      param.query("gender", "gender of NEW user", "string", true),
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
    res.send(JSON.stringify("test is ok"));
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