var
  _       = require('underscore'),
  rooms   = [],
  colors  = ['yellow', 'red', 'green', 'blue'],

create = function (player) {
  player.role   = 'host';
  player.color  = _.first(colors);

  var room = {};
  room.roomId   = uniqueId();
  room.players  = [player];
  rooms.push(room);

  return room;
},

join = function (roomId, player) {
  var index = locate(roomId);

  player.role   = null;
  player.color  = colors[rooms[index].players.length];

  rooms[index].players.push(player);
  return rooms[index];
},

updatePostion = function (roomId, socketId, x, y) {
  var
    roomIindex  = locate(roomId),
    players     = rooms[roomIindex].players,
    index       = locatePlayer(players, socketId);

  players[index].x = x;
  players[index].y = y;

  return players;
},

findPlayer = function (roomId, socketId) {
  var
    roomIindex  = locate(roomId),
    players     = rooms[roomIindex].players,
    index       = locatePlayer(players, socketId);

    return players[index];
},

delete = function (roomId) {
  var index = locate(roomId);
  rooms.splice(index, 1);
},

locate = function (roomId) {
  var index;

  _.each(rooms, function (item, i) {
    if(item.roomId.toString() === roomId.toString()) {
      index = i;
    }
  });

  return index;
},

locatePlayer = function (players, socketId) {
  var index;

  _.each(players, function (item, i) {
    if(item.socketId.toString() === socketId.toString()) {
      index = i;
    }
  });

  return index;
},

uniqueId = function () {
  var id, existing;

  do {
    existing  = _.pluck(rooms, 'roomId');
    id        = randomId();
  }
  while (_.contains(existing, id));
  return id;
},

randomId = function () {
  return (Math.random() * 10000) | 1;
};

module.exports = {
  create: create,
  join: join,
  updatePostion: updatePostion,
  findPlayer: findPlayer,
  delete: delete
};
