var expressInstance = require('./expressInstance');
var apiServer = expressInstance.apiServer;
var io = require('socket.io')(apiServer);
var user = {'count': 0};


//SOCKETIO
io.on('connection', function (socket) {
  user.count++;
  console.log('a user connected, number of users = ' + user.count);
  socket.broadcast.emit('this', { content: 'a user connected.', timestamp: Date.now()});

  socket.on('private message', function (from, msg) {
    console.log('I received a private message by ', from, ' saying ', msg);
  });

  socket.on('getonecall', function(data){
    console.log('wow this works!!');
    console.log(data);
    socket.broadcast.emit('home'+data.home_id, { content: data.home_id + ' API CALLED YO.', timestamp: Date.now()});
    socket.disconnect();
  });

  socket.on('getAll', function(data){
    console.log('wow this works!!');
    console.log(data);
    socket.broadcast.emit('this', { content: 'GETALL API CALLED YO.', timestamp: Date.now()});
  });

  socket.on('disconnect', function () {
    user.count--;
    io.emit('disconnection',{content: 'a user disconnected', timestamp: Date.now()});
    console.log('a user disconnected, number of users = ' + user.count);
  });
});

exports.io = io;