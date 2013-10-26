var socket = io.connect();

angular.module('routerApp', ['ngRoute']).

config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', { templateUrl: '/templates/login.html' });
  $routeProvider.when('/game', { templateUrl: '/templates/game.html', controller: "game" });
  $routeProvider.when('/host', { templateUrl: '/templates/host.html', controller: "host" });
  $routeProvider.when('/lobby', { templateUrl: '/templates/lobby.html', controller: "lobby" });
  $routeProvider.otherwise({ redirectTo: '/' });
}]).

controller("game", function () {
  initGame();
}).

controller("host", function ($scope, $location) {
  $scope.submit = function () {
    socket.emit('createGame', { name: $scope.name });
    $location.path('lobby');
  };

  socket.on('gameCreated', function (data) {
    App.players = data.players;
    App.roomId  = data.roomId;
  });
}).

controller('join', function ($scope, $location) {
  $scope.submit = function () {
    socket.emit('joinGame', { name: $scope.name, roomId: $scope.roomId });
    $location.path('lobby');
  }
}).

controller("lobby", function ($scope) {
  $scope.players = App.players;
  $scope.roomId = App.roomId;

  socket.on('playerJoined', function (data) {
    $scope.players = App.players = data.players;
  });
});
