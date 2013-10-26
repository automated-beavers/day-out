App.ui = (function () {

  var
    $name        = $('#name'),
    $hostGame    = $('#host-game'),
    $joinGame    = $('#join-game'),
    $roomId      = $('#room-id'),

  init = function () {
    bindEvents();
  },

  bindEvents = function () {
    $hostGame.on('submit', hostGame);
    $joinGame.on('submit', joinGame);
  },

  hostGame = function () {
    App.io.emit('createGame', { name: $name.val() });
  },

  joinGame = function () {
    App.io.emit('joinGame', { name: $name.val(), roomId: $roomId.val() });
  };

  return {
    init: init
  };

})();

App.ui.init();
