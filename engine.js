var
  io,
  socket,
  Room = require('./room'),

init = function(gameIo, gameSocket){
  io      = gameIo;
  socket  = gameSocket;
  bindEvents();
},

bindEvents = function () {
  connection();
  socket.on('createRoom', createRoom);
  socket.on('joinRoom', joinRoom);
  socket.on('hostStartGame', hostStartGame);
  socket.on('positionCreate', positionCreate);
  socket.on('finished', finished);
  socket.on('disconnect', disconnect);
},

connection = function () {
  socket.emit('socketId', { socketId: socket.id });
},

createRoom = function (data) {
  var player = {};
  player.socketId = socket.id;
  player.name     = data.name;

  var room = Room.create(player);

  socket.join(room.roomId);
  socket.emit('roomCreated', { roomId: room.roomId, players: room.players });
},

joinRoom = function (data) {
  var
    roomId    = data.roomId,
    roomCount = io.sockets.clients(roomId).length;

  if(roomCount > 4) {
    socket.emit('error', { message: 'The room is full' });
    return;
  }

  var player  = {};
  player.socketId = socket.id;
  player.name     = data.name;

  var room = Room.join(roomId, player);
  socket.join(roomId);

  socket.emit('roomJoined', { roomId: roomId, players: room.players });
  io.sockets.in(roomId).emit('playerJoined', { players: room.players });
},

hostStartGame = function (data) {
  io.sockets.in(data.roomId).emit('startGame');
},

positionCreate = function (data) {
  var roomId = data.roomId;

  if(roomId) {
    var players = Room.updatePostion(roomId, socket.id, data.x, data.y);
    io.sockets.in(roomId).emit('positionUpdate', { players: players });
  }
},

finished = function (data) {
  var roomId = data.roomId,
      winner = Room.findPlayer(roomId, socket.id);

  io.sockets.in(roomId).emit('endGame', { winner: winner });
  Room.destroy(roomId);
},

disconnect = function () {

}

exports.init = init;
