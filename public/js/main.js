var App = {
  game: {},
  roomId: undefined,
  socketId: undefined,
  players: [{color: 'yellow'}, {color: 'red'}, {color: 'green'}, {color: 'blue'}],
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
