var socket = require('socket.io-client')('http://localhost:3211');
var home_id = process.argv[2] || 'default';

socket.on('connect', function(){
 console.log('you are connected');
});

socket.on('disconnect', function(){});


socket.on('this', function(data){
 var msgtime = new Date(data.timestamp);
 console.log(msgtime.getHours() + ':' + msgtime.getMinutes() + ':' + msgtime.getSeconds() + ' : ' + data.content);
});

socket.on('disconnection', function(data){
 var msgtime = new Date(data.timestamp);
 console.log(msgtime.getHours() + ':' + msgtime.getMinutes() + ':' + msgtime.getSeconds() + ' : ' + data.content);
});

socket.on('getone', function(data){
 var msgtime = new Date(data.timestamp);
 console.log(msgtime.getHours() + ':' + msgtime.getMinutes() + ':' + msgtime.getSeconds() + ' : ' + data.content);
});
socket.on('home'+home_id, function(data){
 var msgtime = new Date(data.timestamp);
 console.log(msgtime.getHours() + ':' + msgtime.getMinutes() + ':' + msgtime.getSeconds() + ' : ' + data.content);
});
