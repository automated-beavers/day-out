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
  socket.emit('connected', { message: 'You are connected!' });
  socket.on('createGame', createGame);
  socket.on('joinGame', joinGame);
},

createGame = function (data) {
  var
    roomId  = (Math.random() * 100000) | 1,
    player  = { socketId: this.id, name: data.name };
    players = newPlayer(roomId, player);

  this.join(roomId);
  this.emit('gameCreated', { players: players });
},

joinGame = function (data) {
  var
    roomId  = data.roomId,
    player  = { socketId: this.id, name: data.name },
    players = io.sockets.clients(roomId);

  if(players.count < 4) {
    var updatedPlayers = newPlayer(roomId, player);
    this.join(roomId);

    this.emit('gameJoined', { players: updatedPlayers });
    socket.broadcast.to(roomId).emit('playerJoined', data);
  }
},

newPlayer = function (roomId, player) {
  var roomIndex;

  _.each(rooms, function (item, index) {
    if(item.roomId === roomId) {
      roomIndex = index;
    }
  });

  if(roomIndex) {
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
