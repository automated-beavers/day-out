angular.module('routerApp', ['ngRoute']).

config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', { templateUrl: '/templates/game.html' });
  $routeProvider.otherwise({ redirectTo: '/' });
}]);
