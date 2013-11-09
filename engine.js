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
  socket.emit('connected');
  socket.on('requestSocketId', requestSocketId);
  socket.on('createRoom', createRoom);
  socket.on('joinRoom', joinRoom);
  socket.on('hostStartGame', hostStartGame);
  socket.on('positionCreate', positionCreate);
  socket.on('finished', finished);
},

requestSocketId = function () {
  this.emit('socketId', { socketId: this.id });
},

createRoom = function (data) {
  var player = {};
  player.socketId = this.id;
  player.name     = data.name;

  var room = Room.create(player);

  this.join(room.roomId);
  this.emit('roomCreated', { roomId: room.roomId, players: room.players });
},

joinRoom = function (data) {
  var
    roomId    = data.roomId,
    roomCount = io.sockets.clients(roomId).length;

  if(roomCount > 4) {
    this.emit('error', { message: 'The room is full' });
    return;
  }

  var player  = {};
  player.socketId = this.id;
  player.name     = data.name;

  var room = Room.join(roomId, player);
  this.join(roomId);

  this.emit('roomJoined', { roomId: roomId, players: room.players });
  io.sockets.in(roomId).emit('playerJoined', { players: room.players });
},

hostStartGame = function (data) {
  io.sockets.in(data.roomId).emit('startGame');
},

positionCreate = function (data) {
  var roomId = data.roomId;

  if(roomId) {
    var players = Room.updatePostion(roomId, this.id, data.x, data.y);
    io.sockets.in(roomId).emit('positionUpdate', { players: players });
  }
},

finished = function (data) {
  var winner = Room.findPlayer(data.roomId, this.id);
  io.sockets.in(data.roomId).emit('endGame', { winner: winner });
};

exports.init = init;
