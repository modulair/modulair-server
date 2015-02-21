var express = require('express');
var url =require('url');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var chalk = require('chalk');

var mongo = require('mongoskin');
var db = mongo.db("mongodb://localhost:27017/scratch-test", {native_parser:true});

//BASE ROUTE
var domain = 'localhost';
var applicationUrl = 'http://' + domain + ':3211/v1';

var apiIndex = require('./routes/apiIndex');
//API SERVER
var api = express();
var subpath = express();
// view engine setup
api.set('views', path.join(__dirname, 'views'));
api.set('view engine', 'jade');
api.set('json spaces', 3);
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
    , userResources = require('./resources/userResources')
    , homeResources = require('./resources/homeResources')
    , systemResources = require('./resources/systemResources');


swagger.setApiInfo({
    title: "Modulair API",
    description: "API to manage Modulair systems",
    termsOfServiceUrl: "http://modulair.io/terms",
    contact: "muhammad.mustadi@gmail.com",
    license: "",
    licenseUrl: ""
});

swagger.addModels(models)
    //TEST
    .addGet(test.dummyTestMethod)
    //USER RESOURCES
    .addGet(userResources.getAll)
    .addGet(userResources.getOneById)
    .addPost(userResources.addOne)
    //HOME RESOURCES
    .addGet(homeResources.getAll)
    .addPost(homeResources.addOne)
    //SYSTEM RESOURCES
    .addGet(systemResources.getAll)
    .addPost(systemResources.addOne);


// Set api-doc path
swagger.configureSwaggerPaths('', 'api-docs', '');
swagger.configure(applicationUrl, '0.1.0');

swagger.configureDeclaration('test', {
    description: 'For testing purposes',
    protocols : ["http"]
});
swagger.configureDeclaration('users', {
    description: 'Operations about Users',
    protocols : ["http"]
});
swagger.configureDeclaration('homes', {
    description: 'Operations about Homes',
    protocols : ["http"]
});

// Set header and X-Origin CORS FYEA
swagger.setHeaders = function setHeaders(res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, X-API-KEY");
  res.header("Content-Type", "application/json; charset=utf-8");
};

    
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
    res.json({code:404, message: "What are you looking for?"});
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
module.exports = api;
//SWAGGER END
//END OF API SERVER