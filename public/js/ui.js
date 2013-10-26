App.ui = (function () {

  var
    name        = $('#name'),
    hostGame    = $('#host-game'),
    joinGame    = $('#join-game'),
    roomId      = $('#room-id'),

  init = function () {
    bindEvents();
  },

  bindEvents = function () {
    hostGame.on('submit', hostGame);
    joinGame.on('submit', joinGame);
  },

  hostGame = function () {
    socket.emit('createGame', { name: name.val() });
  },

  joinGame = function () {
    socket.emit('joinGame', { name: name.val(), roomId: roomId.val() });
  };

})();

App.ui.init();
