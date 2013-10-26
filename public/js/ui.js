App.ui = (function () {

  var
    $name        = $('#name'),
    $joinGame    = $('#join-game'),
    $roomId      = $('#room-id'),

  init = function () {
    bindEvents();
  },

  bindEvents = function () {
    $hostGame.on('submit', hostGame);
    $joinGame.on('submit', joinGame);
  },

  joinGame = function () {
    App.io.emit('joinGame', { name: $name.val(), roomId: $roomId.val() });
  };

  return {
    init: init
  };

})();

// App.ui.init();
