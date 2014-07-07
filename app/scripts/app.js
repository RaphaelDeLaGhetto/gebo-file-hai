'use strict';

angular.module('geboHai', ['ngResource', 'ngRoute', 'ui.bootstrap',
                           'gebo-client-token', 'gebo-client-token'])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/action', {
        templateUrl: 'views/action.html',
        controller: 'ActionCtrl'
      })
      .when('/token', {
        templateUrl: 'views/token.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  }]);
