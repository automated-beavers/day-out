var socket = io.connect();

angular.module('routerApp', ['ngRoute']).

config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', { templateUrl: '/templates/login.html' });
  $routeProvider.when('/game', { templateUrl: '/templates/game.html', controller: "game" });
  $routeProvider.when('/host', { templateUrl: '/templates/host.html', controller: "host" });
  $routeProvider.when('/join', { templateUrl: '/templates/join.html', controller: "join" });
  $routeProvider.when('/lobby', { templateUrl: '/templates/lobby.html', controller: "lobby" });
  $routeProvider.when('/error', { templateUrl: '/templates/error.html', controller: "error" });
  $routeProvider.otherwise({ redirectTo: '/' });
}]).

run(function ($rootScope, $location) {
  socket.on('error', function (data) {
    $rootScope.message = data.message;
    $location.path('error');
    $rootScope.$apply();
  });

  socket.on('connected', function (data) {
    socket.emit('requestSocketId');
  });

  socket.on('socketId', function (data) {
    App.socketId = data.socketId;
  });
}).

controller("game", function () {
  App.game.init();
}).

controller("host", function ($scope, $location) {
  socket.on('roomCreated', function (data) {
    App.players = data.players;
    App.roomId  = data.roomId;
    $location.path('lobby');
    $scope.$apply();
  });

  $scope.submit = function () {
    socket.emit('createRoom', { name: $scope.name });
  };
}).

controller('join', function ($scope, $location) {
  $scope.submit = function () {
    socket.emit('joinRoom', { name: $scope.name, roomId: $scope.roomId });
  }

  socket.on('roomJoined', function (data) {
    App.players = data.players;
    App.roomId  = data.roomId;
    $location.path('lobby');
    $scope.$apply();
  });
}).

controller("lobby", function ($scope, $location) {
  $scope.players        = App.players;
  $scope.roomId         = App.roomId;
  $scope.currentPlayer  = App.currentPlayer();
  $scope.$location      = $location;

  socket.on('playerJoined', function (data) {
    App.players     = data.players;
    $scope.players  = data.players;
    $scope.$apply();
  });

  $scope.startGame = function () {
    $location.path('game');
  };
}).

controller('error', function ($scope, $rootScope) {
  $scope.message = $rootScope.message;
});
