var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var chalk = require('chalk');

// //DATABASE BRO
// var mongo = require('mongodb');
// var monk = require('monk');
// var db = monk('localhost:27017/scratch-test');

//MONGOSKIN BRO
var mongo = require('mongoskin');
var db = mongo.db("mongodb://localhost:27017/scratch-test", {native_parser:true});
        
var routes = require('./routes/index');
var users = require('./routes/users');
var homes = require('./routes/homes');
var systems = require('./routes/systems');
var subsystems = require('./routes/subsystems');

var app = express(),
    subApp = express();
//     swagger = require("swagger-node-express").createNew(app);
// console.log(swagger);

// var findById = {
//   'spec': {
//     "description" : "Operations about pets",
//     "path" : "/pet.{format}/{petId}",
//     "notes" : "Returns a pet based on ID",
//     "summary" : "Find pet by ID",
//     "method": "GET",
//     "parameters" : [swagger.paramTypes.path("petId", "ID of pet that needs to be fetched", "string")],
//     "type" : "Pet",
//     "responseMessages" : [swagger.errors.invalid('id'), swagger.errors.notFound('pet')],
//     "nickname" : "getPetById"
//   },
//   'action': function (req,res) {
//     if (!req.params.petId) {
//       throw swagger.errors.invalid('id');
//     }
//     var id = parseInt(req.params.petId);
//     var pet = petData.getPetById(id);

//     if (pet) {
//       res.send(JSON.stringify(pet));
//     } else {
//       throw swagger.errors.notFound('pet');
//     }
//   }
// };

// swagger.addGet(findById);
// swagger.configure("/api", "0.1");
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
    req.db = db;
    next();
});


//ROUTES BRO
app.use('/', routes);
app.use('/users', users);
app.use('/homes', homes);
app.use('/systems', systems);
app.use('/subsystems', subsystems);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;