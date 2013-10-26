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
    App.roomId  = data.roomId;
  },

  playerJoined = function (data) {
    App.players = data.players;
    App.roomId  = data.roomId;
  },

  on = function (eventName, callback) {
    socket.on(eventName, callback);
  },

  emit = function (eventName, data) {
    socket.emit(eventName, data);
  };

  return {
    init: init,
    on: on,
    emit: emit
  }

})();

App.io.init();
