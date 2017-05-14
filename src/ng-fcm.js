/**
 * Created by Danilo on 14-05-2017.
 */
(function () {
    const messaging = firebase.messaging();

    angular.module('ngFcm', [])
        .run(function ($log, ngFcmService, $rootScope) {
            $log.info('ng-fcm started.');

            // Callback fired if Instance ID token is updated.
            messaging.onTokenRefresh(function () {
                ngFcmService.getToken();
            });

            // Handle incoming messages. Called when:
            // - a message is received while the app has focus
            // - the user clicks on an app notification created by a service worker
            //   `messaging.setBackgroundMessageHandler` handler.
            messaging.onMessage(function (payload) {
                $rootScope.$broadcast('ngFcm.messageReceived', payload);
            });
        })
        .service('ngFcmService', function ngFcmService($q, $log, $rootScope) {
            var self = this;

            self.getToken = function getToken() {
                return $q(function (resolve, reject) {
                    // Get Instance ID token. Initially this makes a network call, once retrieved
                    // subsequent calls to getToken will return from cache.
                    messaging.getToken()
                        .then(function (currentToken) {
                            $rootScope.$broadcast('ngFcm.token', currentToken);
                            resolve(currentToken);
                        })
                        .catch(function (error) {
                            $rootScope.$broadcast('ngFcm.error', error);
                            reject(error);
                        });
                });
            };

            self.requestPermission = function requestPermission() {
                return $q(function (resolve, reject) {
                    messaging.requestPermission()
                        .then(function (response) {
                            $rootScope.$broadcast('ngFcm.permissionGranted');
                            resolve(response);
                        })
                        .catch(function (error) {
                            $rootScope.$broadcast('ngFcm.permissionDenied');
                            reject(error);
                        });
                });
            };

            self.deleteToken = function deleteToken(currentToken){
                return $q(function(resolve, reject){
                    messaging.deleteToken(currentToken)
                        .then(function() {
                            resolve(true);
                        })
                        .catch(function(error) {
                            reject(error);
                        });
                });
            };
        });
})();