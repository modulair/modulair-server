var mongo = require('mongoskin');
var params = require("../node_modules/swagger-node-express/lib/paramTypes");
var errorHandling = require('../node_modules/swagger-node-express/lib/errorHandling').error;
var BSON = mongo.BSONPure;
var async = require('async');
var mongoose = require('mongoose');