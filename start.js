var expressInstance = require('./expressInstance');
var ioInstance = require('./ioInstance');
var chalk = require('chalk');

if (process.env.NODE_ENV=='production') {
  console.log('environment: ' + chalk.bgGreen(process.env.NODE_ENV));
} else if (process.env.NODE_ENV=='testing') {
  console.log('environment: ' + chalk.bgYellow(process.env.NODE_ENV));
} else {
  console.log('environment: ' + chalk.bgRed(process.env.NODE_ENV));
}
