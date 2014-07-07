'use strict';

angular.module('geboHai').
    controller('MainCtrl', function ($scope, Token, $location) {

        $scope.verified = false;
        $scope.admin = false;

        /**
         * Configure OAuth2 for interaction with gebo-server
         */
        var baseUrl = window.location.origin;

        Token.setEndpoints({
            clientId: 'gebo-file-hai@capitolhill.ca',
            clientName: 'gebo-file-hai',
            gebo: 'https://localhost:3443',
            localStorageName: 'gebo-file-hai-token',
            redirect: baseUrl + '/components/gebo-client-token/dist/oauth2callback.html',
          });
        
        /**
         * See if this client already has a token 
         */
        $scope.accessToken = Token.get();
        
        if ($scope.accessToken) {
          Token.verify($scope.accessToken).
            then(function(data) {
                    $scope.agentName = data.name;
                    $scope.verified = true;
                    $scope.admin = data.admin;
                }, function() {
                    window.alert('You have an expired or invalid token.');
              });
        }

        /**
         * Allow gebo-client access to the gebo user's resources
         */
        $scope.authenticate = function() {
            var extraParams = {};
            Token.getTokenByPopup(extraParams)
                .then(function(params) {
                    // Success
                    Token.verify(params.access_token).
                    then(function(data) {
                            $scope.accessToken = params.access_token;
                            $scope.agentName = data.name;
                            $scope.verified = true;
                            $scope.admin = data.admin;
                            Token.set(params.access_token);
			    $location.path('/action');
                        }, function() {
                            window.alert('Cannot verify token.');
                      });
                    }, function() {
                        // Failure
                        window.alert('Failed to get token from popup.');
                    });
          };
                    
        /**
         * Disallow gebo-client access to the gebo user's resources
         */
        $scope.deauthenticate = function () {
            delete $scope.agentName;
            delete $scope.accessToken;
            $scope.verified = false;
            $scope.admin = false;
            Token.clear();
            $location.path('/');
        };
  });
