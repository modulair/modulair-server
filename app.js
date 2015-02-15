var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var chalk = require('chalk');

var mongo = require('mongoskin');
var db = mongo.db("mongodb://localhost:27017/scratch-test", {native_parser:true});

var routes = require('./routes/index');
var users = require('./routes/users');
var homes = require('./routes/homes');
var systems = require('./routes/systems');
var subsystems = require('./routes/subsystems');
var apiIndex = require('./routes/apiIndex');

//APP SERVER
var app = express();

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
// //ROUTES BRO
// app.use('/api', subpath);
app.use('/swagger', express.static(path.join(__dirname, 'node_modules/swagger-node-express/swagger-ui')));
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


exports.app = app;
//END OF APP SERVER

//API SERVER
var api = express();
var subpath = express();
// view engine setup
api.set('views', path.join(__dirname, 'views'));
api.set('view engine', 'jade');
// uncomment after placing your favicon in /public
api.use(favicon(__dirname + '/public/favicon.ico'));
api.use(logger('dev'));
api.use(bodyParser.json());
api.use(cookieParser());
api.use(bodyParser.urlencoded({ extended: false }));
//swagger
api.use("/v1", subpath);
var swagger = require('swagger-node-express').createNew(subpath)
    , test = require("./models/test")
    , models = require("./models/models")
    , userResources = require('./resources/userResources');
// swagger.addValidator(
//   function validate(req, path, httpMethod) {
//     //  example, only allow POST for api_key="special-key"
//     if ("POST" == httpMethod || "DELETE" == httpMethod || "PUT" == httpMethod) {
//       var apiKey = req.headers["api_key"];
//       if (!apiKey) {
//         apiKey = url.parse(req.url,true).query["api_key"];
//       }
//       if ("special-key" == apiKey) {
//         return true; 
//       }
//       return false;
//     }
//     return true;
//   }
// );
swagger.setApiInfo({
    title: "Modulair API",
    description: "API to manage Modulair systems",
    termsOfServiceUrl: "http://modulair.io/terms",
    contact: "muhammad.mustadi@gmail.com",
    license: "",
    licenseUrl: ""
});

swagger.addModels(models)
    .addGet(test.dummyTestMethod)
    .addGet(userResources.getAll)
    .addPost(userResources.addUser);

// Set api-doc path
swagger.configureSwaggerPaths('', 'api-docs', '');

var domain = 'localhost';
var applicationUrl = 'http://' + domain + ':3211/v1';
swagger.configure(applicationUrl, '0.1.0');

var api_handler = express.static(path.join(__dirname, 'node_modules/swagger-node-express/swagger-ui'));

api.get(/^\/docs(\/.*)?$/, function(req, res, next) {
      if (req.url === '/docs') { // express static barfs on root url w/o trailing slash
        res.writeHead(302, { 'Location' : req.url + '/' });
        res.end();
        return;
      }
      // take off leading /docs so that connect locates file correctly
      req.url = req.url.substr('/docs'.length);
      return api_handler(req, res, next);
    });

api.use(express.static(path.join(__dirname, 'public')));
api.use('/', apiIndex);
// catch 404 and forward to error handler
api.use(function(req, res, next) {
    res.status(404);
    res.send(JSON.stringify("Not found."));
});

// error handlers

// development error handler
// will print stacktrace
if (api.get('env') === 'development') {
    api.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
api.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
exports.api = api;
//SWAGGER END
//END OF API SERVER