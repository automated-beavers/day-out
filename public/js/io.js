App.io = (function () {

  var socket,

  init = function () {
    socket = io.connect();
    bindEvents();
  },

  // Receivers

  bindEvents = function () {
    socket.on('connected', connected);
    socket.on('gameCreated', gameCreated);
  },

  connected = function (data) {
    console.log(data.message);
  },

  gameCreated = function (data) {
    App.session.gameId = data.gameId;
    App.session.socketId = data.socketId;
  }

  // Emitters

  createGame = function (data) {
    socket.emit('createGame', data.name);
  };

  return {
    init: init,
    createGame: createGame
  }

})();

App.io.init();

App.session = {};
