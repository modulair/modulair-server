'use strict';

exports.errorHandler = error;

// TODO can this be removed?
// Create Error JSON by code and text
function error(code, description) {
  return {
    'code'   : code,
    'result' : "failure",
    'message': description
  };
}

var params = {};
params.query =  function(name, description, type, required, allowableValuesEnum, defaultValue) {
  return {
    'name' : name,
    'description' : description,
    'type' : type,
    'required' : required,
    'enum' : allowableValuesEnum,
    'defaultValue' : defaultValue,
    'paramType' : 'query'
  };
};

params.q =  function(name, description, type, required, allowableValuesEnum, defaultValue) {
  return {
    'name' : name,
    'description' : description,
    'type' : type,
    'required' : required,
    'enum' : allowableValuesEnum,
    'defaultValue' : defaultValue,
    'paramType' : 'query'
  };
};
params.path = function(name, description, type, allowableValuesEnum, defaultValue) {
  return {
    'name' : name,
    'description' : description,
    'type' : type,
    'required' : true,
    'enum' : allowableValuesEnum,
    'paramType' : 'path',
    'defaultValue' : defaultValue
  };
};

params.body = function(name, description, type, defaultValue, required) {
  return {
    'name' : name,
    'description' : description,
    'type' : type,
    'required' : required || false,
    'paramType' : 'body',
    'defaultValue' : defaultValue
  };
};

params.form = function(name, description, type, required, allowableValuesEnum, defaultValue) {
  return {
    'name' : name,
    'description' : description,
    'type' : type,
    'required' : (typeof required !== 'undefined') ? required : true,
    'enum' : allowableValuesEnum,
    'paramType' : 'form',
    'defaultValue' : defaultValue
  };
};

params.header = function(name, description, type, required) {
  return {
    'name' : name,
    'description' : description,
    'type' : type,
    'required' : required,
    'allowMultiple' : false,
    'paramType' : 'header'
  };
};
exports.params = params;
