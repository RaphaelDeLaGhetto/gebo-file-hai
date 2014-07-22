'use strict';

angular.module('geboHai')
  .controller('ActionCtrl', function ($scope, Token) {

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
     * Since styling file upload inputs is such a 
     * pain, I set the element's style to display:none and 
     * call this function to trigger the click event from a
     * visible button element.
     */
    $scope.clickHiddenInput = function() {
        document.getElementById('fileUploadButton').click();
      };

    /**
     * List the documents contained in the given collection
     *
     * @param string
     */
    $scope.ls = function() {
        var message = {
            sender: Token.agent().email,
            performative: 'request',
            action: 'ls',
            content: { resource: 'files', fields: ['_id', 'name', 'lastModified'] }, 
            gebo: Token.getEndpoints().gebo,
        };

        Token.perform(message).
            then(function(data) {
                $scope.documents = data;
              }).              
            catch(function(err) {               
                console.log(err);
              });
      };

    /**
     * Send files to the gebo
     */
    $scope.upload = function(files) {
        $scope.progress = 'Starting...';
        
//        for (var i = 0; i < files.length; i++) {
          $scope.data = null;
          $scope.resnerJson = null;
          $scope.opponentJson = null;
  
          var form = new FormData();
          form.append('sender', Token.agent().email);
          form.append('performative', 'request');
          form.append('action', 'save');
          //form.append('content', JSON.stringify({ opponent: 'HireAbility' }));
          form.append('gebo', Token.getEndpoints().gebo);
          //form.append('files', files[i]);
          form.append('files', files);
  
          Token.perform(form).
              then(function(out) {
//                  $scope.progress = i + '/' + files.length;// + ', ' + files[i].name;
//                  if (i === files.length) {
                    $scope.progress = 'Done, ' + $scope.progress;
//                  }
                }).
              catch(function(err) {
                  console.log(err);
                  $scope.error = JSON.stringify(err, null, 4);
                });
//        }
      };

  });
