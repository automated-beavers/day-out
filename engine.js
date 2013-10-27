var
  io,
  socket,
  rooms   = [],
  _       = require('underscore'),
  colors  = ['yellow', 'red', 'green', 'blue'],

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
},

requestSocketId = function () {
  this.emit('socketId', { socketId: this.id });
},

createRoom = function (data) {
  var
    roomId  = (Math.random() * 100000) | 1,
    player  = { socketId: this.id, name: data.name };
    players = newPlayer(roomId, player);

  this.join(roomId);
  this.emit('roomCreated', { roomId: roomId, players: players });
},

joinRoom = function (data) {
  var
    roomId  = data.roomId,
    player  = { socketId: this.id, name: data.name },
    players = io.sockets.clients(roomId);

  if(players.length < 4) {
    var updatedPlayers = newPlayer(roomId, player);
    this.join(roomId);
    this.emit('roomJoined', { roomId: roomId, players: updatedPlayers });
    socket.broadcast.to(roomId).emit('playerJoined', { players: updatedPlayers });
  } else {
    this.emit('error', { message: 'The room is full' });
  }
},

newPlayer = function (roomId, player) {
  var roomIndex;

  _.each(rooms, function (item, index) {
    if(item.roomId.toString() === roomId.toString()) {
      roomIndex = index;
    }
  });

  console.log(roomIndex);

  if(roomIndex !== undefined) {
    player.color = colors[rooms[roomIndex].players.length];
    rooms[roomIndex].players.push(player);
    return rooms[roomIndex].players;
  }
  else {
    player.role = 'host';
    player.color = colors[0];
    rooms.push({ roomId: roomId, players: [player] });
    return [player];
  }
};

exports.init = init;
