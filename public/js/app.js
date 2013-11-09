var socket = io.connect();

angular.module('routerApp', ['ngRoute']).

config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', { templateUrl: '/templates/login.html' });
  $routeProvider.when('/game', { templateUrl: '/templates/game.html', controller: "game" });
  $routeProvider.when('/host', { templateUrl: '/templates/host.html', controller: "host" });
  $routeProvider.when('/join', { templateUrl: '/templates/join.html', controller: "join" });
  $routeProvider.when('/lobby', { templateUrl: '/templates/lobby.html', controller: "lobby" });
  $routeProvider.when('/error', { templateUrl: '/templates/error.html', controller: "error" });
  $routeProvider.when('/score', { templateUrl: '/templates/score.html', controller: "score" });
  $routeProvider.otherwise({ redirectTo: '/' });
}]).

run(function ($rootScope, $location) {
  socket.on('error', function (data) {
    $rootScope.message = data.message;
    $location.path('error');
    $rootScope.$apply();
  });

  socket.on('socketId', function (data) {
    App.socketId = data.socketId;
  });
}).

controller("game", function ($location, $scope) {
  if(!App.roomId) {
    $location.path('/').replace();
  }

  App.game.init();

  socket.on('endGame', function (data) {
    App.winner = data.winner;
    $location.path('score');
    $scope.$apply();
  });
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
  socket.on('roomJoined', function (data) {
    App.players = data.players;
    App.roomId  = data.roomId;
    $location.path('lobby');
    $scope.$apply();
  });

  $scope.submit = function () {
    socket.emit('joinRoom', { name: $scope.name, roomId: $scope.roomId });
  }
}).

controller("lobby", function ($scope, $location) {
  if(!App.roomId) {
    $location.path('/').replace();
  }

  $scope.players        = App.players;
  $scope.roomId         = App.roomId;
  $scope.currentPlayer  = App.currentPlayer();
  $scope.$location      = $location;

  $scope.hostStartGame = function () {
    socket.emit('hostStartGame', { roomId: App.roomId });
  };

  socket.on('playerJoined', function (data) {
    App.players     = data.players;
    $scope.players  = data.players;
    $scope.$apply();
  });

  socket.on('startGame', function () {
    $location.path('game');
    $scope.$apply();
  });
}).

controller('score', function($scope, $location) {
  if(!App.roomId) {
    $location.path('/').replace();
  }
  App.roomId = undefined;
  $scope.winner = App.winner;
}).

controller('error', function ($scope, $rootScope) {
  $scope.message = $rootScope.message;
});
