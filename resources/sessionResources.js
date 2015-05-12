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
