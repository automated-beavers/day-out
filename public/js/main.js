var App = {
  game: {},
  roomId: undefined,
  socketId: undefined,
  players: [],
  currentPlayer: function () {
    var found;
    App.players.forEach(function(item) {
      if(item.socketId === App.socketId) {
        found = item;
      }
    });
    return found;
  }
}
