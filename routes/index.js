var express = require('express');
var router = express.Router();
var http = require('http');
// var querystring = require('querystring');

// var data = querystring.stringify({
//       username: yourUsernameValue,
//       password: yourPasswordValue
//     });



// var req = http.request(options, function(res) {
//     res.setEncoding('utf8');
//     res.on('data', function (chunk) {
//         console.log("body: " + chunk);
//     });
// });

// req.write(data);
// req.end();

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.send(JSON.stringify(req));
  console.log(req);

  // res.status(200);
  // res.json(req);
  res.render('index', { title: 'scratch-server' });
});

router.get('/register', function(req, res, next) {
  // res.send(JSON.stringify(req));
  // res.status(200);
  // res.json(req);
  res.render('register');
});


router.post('/register', function(req, res, next) {
  var data = JSON.stringify(req.body);
  var options = {
    host: 'localhost',
    port: 3211,
    path: '/v1/users/add',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
  };
  var sending = http.request(options, function(result) {
    console.log(result);
      result.setEncoding('utf8');
      result.on('data', function (chunk) {
          console.log("body: " + chunk);
      });
  });

  sending.write(data);
  sending.end();
  res.render('index', { title: 'user added.' });
});



/* GET welcome page. */
router.get('/welcome', function(req, res, next) {
  res.render('welcome', { title: 'scratch-server' });
});

// /* GET Userlist page. */
// router.get('/userlist', function(req, res) {
//     var db = req.db;
//     var collection = db.get('usercollection');
//     collection.find({},{},function(e,docs){
//         res.render('userlist', {
//             "userlist" : docs
//         });
//     });
// });

// /* GET New User page. */
// router.get('/newuser', function(req, res) {
//     res.render('newuser', { title: 'Add New User' });
// });
// /* POST to Add User Service */
// router.post('/adduser', function(req, res) {

//     // Set our internal DB variable
//     var db = req.db;

//     // Get our form values. These rely on the "name" attributes
//     var userName = req.body.username;
//     var userEmail = req.body.useremail;

//     // Set our collection
//     var collection = db.get('usercollection');

//     // Submit to the DB
//     collection.insert({
//         "username" : userName,
//         "email" : userEmail
//     }, function (err, doc) {
//         if (err) {
//             // If it failed, return error
//             res.send("There was a problem adding the information to the database.");
//         }
//         else {
//             // If it worked, set the header so the address bar doesn't still say /adduser
//             res.location("userlist");
//             // And forward to success page
//             res.redirect("userlist");
//         }
//     });
// });


module.exports = router;
