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
    App.players = data.players;
  },

  playerJoined = function (data) {
    App.players = data.players;
  },

  // Emitters

  joinGame = function (data) {
    socket.emit('joinGame', data);
  };

  return {
    init: init
  }

})();

App.io.init();
