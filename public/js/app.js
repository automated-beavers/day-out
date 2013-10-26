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
  $scope.submit = function(){
    App.io.emit('createGame', { name: $scope.name });
    $location.path('lobby');
  }
}).

controller("lobby", function($scope){
  $scope.players = App.players;
  $scope.roomId = App.roomId;
});