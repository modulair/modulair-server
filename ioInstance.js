var expressInstance = require('./expressInstance');
var apiServer = expressInstance.apiServer;
var io = require('socket.io')(apiServer);
var user = {'count': 0};




//SOCKETIO
io.on('connection', function (socket) {
  user.count++;
  console.log('a user connected, number of users = ' + user.count);
  socket.broadcast.emit('this', { content: 'a socket connected.', timestamp: Date.now()});
  
  socket.on('camera', function (data) {
          io.emit('androidcam', data);
          io.emit('client', data);
          socket.emit('received', data);
      });


  socket.on('/user', function (data) {
    //console.log(data);
    if (data.title=='connect') {
      console.log('user listener connected');
    }
  });
  socket.on('/home', function (data) {
    if (data.title=='connect') {
      console.log('home listener connected');
    }
    //console.log(data);
  });
  socket.on('/system', function (data) {
    //console.log(data);
    if (data.title=='connect') {
      console.log('system listener connected');
    }
  });
  socket.on('/subsystem', function (data) {
    //console.log(data);
    if (data.title=='connect') {
      console.log('subsystem listener connected');
    } else if (data.title=='changeState') {
      io.emit('client', data);
    } else if (data.title=='toggle') {
      io.emit('client', data);
    }
  });


  socket.on('disconnect', function () {
    user.count--;
    io.emit('disconnection',{content: 'a user disconnected', timestamp: Date.now()});
    console.log('a user disconnected, number of users = ' + user.count);
  });
});


exports.io = io;
