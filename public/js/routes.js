angular.module('routerApp', []).

config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', { templateUrl: '/templates/game.html' });
  $routeProvider.otherwise({ redirectTo: '/' });
}]);
