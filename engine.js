var io,
    socket,

init = function(gameIo, gameSocket){
  io      = gameIo;
  socket  = gameSocket;
  bindEvents();
},

bindEvents = function () {
  socket.emit('connected', { message: 'You are connected!' });
  socket.on('createGame', createGame);
},

createGame = function () {
  var gameId = (Math.random() * 100000) | 1;
  this.join(gameId);
  this.emit('gameCreated', { gameId: gameId, socketId: this.id });
};

exports.init = init;
