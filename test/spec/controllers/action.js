//'use strict';
//
//describe('Controller: ActionCtrl', function () {
//
//  // load the controller's module
//  beforeEach(module('geboHai'));
//
//  var ActionCtrl,
//    scope;
//
//  // Initialize the controller and a mock scope
//  beforeEach(inject(function ($controller, $rootScope) {
//    scope = $rootScope.$new();
//    ActionCtrl = $controller('ActionCtrl', {
//      $scope: scope
//    });
//  }));
//
//  it('should attach a friendly greeting to the scope', function () {
//    expect(scope.message).toEqual('Hello, world!');
//  });
//});
//
//
//'use strict';

describe('Controller: ActionCtrl', function () {

    // OAuth2 API stuff
    var GEBO_ADDRESS = 'http://theirhost.com',
        REDIRECT_URI = 'http://myhost.com',
        ACCESS_TOKEN = '1234';

    var VERIFICATION_DATA = {
                collectionName: 'someapp@example.com',
                name: 'dan',
                admin: false,
                read: true,
                write: true,
                execute: true
            };

    var LOCAL_STORAGE_NAME = 'gebo-file-hai-token';

    var DOCUMENT_LIST = [ { _id: '111', file: 'some.jpg' } ];

    // load the controller's module
    beforeEach(module('geboHai'));

    var ActionCtrl,
        Token,
        $httpBackend,
        scope,
        $q;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope, $injector) {

        /**
         * Order appears to matter here. A Token has
         * to be injected and a spy set before the 
         * ActionCtrl is initialized, otherwise all the
         * expected verify GET calls will fail
         */
        Token = $injector.get('Token');

        /**
         * Spies
         */
        spyOn(localStorage, 'getItem').andCallFake(function(key) {
            return ACCESS_TOKEN;
          });


        $httpBackend = $injector.get('$httpBackend');
        scope = $rootScope.$new();

        /**
         * Set up Token before injecting an AppCtrl
         */
        Token.setEndpoints({
          gebo: GEBO_ADDRESS,
          redirect: REDIRECT_URI,
          clientId: 'gebo-file-hai-test@capitolhill.ca',
          clientName: 'gebo-file-hai-test',
          localStorageName: LOCAL_STORAGE_NAME,
        });

        ActionCtrl = $controller('ActionCtrl', {
            $scope: scope,
            Token: Token,
        });

        // For mocking purposes. The ActionCtrl does not 
        // directly make promises
        $q = $injector.get('$q');

        /**
         * Verify the user has been authenticated on page load
         */
        $httpBackend.expectGET(Token.getEndpointUri('verify') + '?access_token=' + ACCESS_TOKEN).
            respond(VERIFICATION_DATA);

        $httpBackend.whenGET(Token.getEndpointUri('verify') + '?access_token=' + ACCESS_TOKEN).
            respond(VERIFICATION_DATA);

        scope.$apply();
        $httpBackend.flush();
    }));

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should do something', function () {
        expect(!!ActionCtrl).toBe(true);
        expect(!!Token).toBe(true);
    });

    /**
     * Has this client already authenticated?
     */
    describe('onload', function() {
  
        beforeEach(inject(function($controller) {
            /**
             * Spies
             */
            var store = {};
            spyOn(Token, 'get').andCallFake(function() {
                return store[LOCAL_STORAGE_NAME];
            });
                                                         
            spyOn(Token, 'set').andCallFake(function(tokenString) {
                store[LOCAL_STORAGE_NAME] = tokenString;
            });
    
            spyOn(Token, 'clear').andCallFake(function(tokenString) {
                delete store[LOCAL_STORAGE_NAME];
            });
    
            spyOn(Token, 'verify').andCallFake(function(token) {
                var deferred = $q.defer();
                deferred.resolve(VERIFICATION_DATA);
                return deferred.promise;
            });
        }));
    
        it('should look for a locally stored token', inject(function($controller) {
            var ctrl = $controller('ActionCtrl', {
                $scope: scope,
                Token: Token
            });

            expect(Token.get).toHaveBeenCalled();
//            expect(scope.accessToken).toBe(undefined);
        }));
    
        it('should verify a locally stored token', inject(function($controller, $rootScope) {
//            $httpBackend.expectPOST(GEBO_ADDRESS + '/perform', {
//                    sender: Token.agent().email,
//                    performative: 'request',
//                    action: 'lsCollections',
//                    gebo: Token.getEndpoints().gebo,
//                    access_token: ACCESS_TOKEN,
//              }).
//            respond(COLLECTION_LIST);

            Token.set(ACCESS_TOKEN);
            var ctrl = $controller('ActionCtrl', {
                $scope: scope,
                Token: Token
            });

            expect(Token.get).toHaveBeenCalled();
            expect(Token.verify).toHaveBeenCalled();

//            expect(scope.verified).toBe(false);
//            expect(scope.agentName).toBe(undefined);
            $rootScope.$apply();
//            $httpBackend.flush();
            expect(scope.verified).toBe(true);
            expect(scope.agentName).toBe('dan');
        }));
    });

    /**
     * ls
     */
    describe('ls', function() {
        beforeEach(function() {
            $httpBackend.whenPOST(GEBO_ADDRESS + '/perform', {
                    sender: Token.agent().email,
                    performative: 'request',
                    action: 'ls',
                    content: { resource: 'files', fields: ['_id', 'name', 'lastModified'] }, 
                    gebo: Token.getEndpoints().gebo,
                    access_token: ACCESS_TOKEN,
              }).
            respond(DOCUMENT_LIST);
        });

        it('should return the list of documents contained in the files collection', function() {
            $httpBackend.expectPOST(GEBO_ADDRESS + '/perform', {
                    sender: Token.agent().email,
                    performative: 'request',
                    action: 'ls',
                    content: { resource: 'files', fields: ['_id', 'name', 'lastModified'] }, 
                    gebo: Token.getEndpoints().gebo,
                    access_token: ACCESS_TOKEN,
              });
            scope.ls();
            scope.$apply();
            $httpBackend.flush();
            expect(scope.documents).toEqual(DOCUMENT_LIST);
        });
    });

});
