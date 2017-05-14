/**
 * Created by Danilo on 14-05-2017.
 */
(function () {
    angular.module('demoApp', ['ngFcm'])
        .component('demo', {
            templateUrl: 'demo.component.html',
            controller: demoFcmCtrl,
            controllerAs: 'dfc',
            bindings: {}
        })
        .service('demoTestService', demoTestService);

    function demoFcmCtrl($scope, ngFcmService, $timeout, demoTestService) {
        var dfc = this;

        dfc.data = {
            browserToken: '',
            status: 'Token not set',
            notification: {},
            serverToken: ''
        };

        dfc.generateToken = function generateToken() {
            ngFcmService.getToken()
                .then(function (currentToken) {
                    if (currentToken) {
                        dfc.data.browserToken = currentToken;
                    } else {
                        ngFcmService.requestPermission()
                            .then(function () {
                                ngFcmService.getToken()
                                    .then(function (currentToken) {
                                        dfc.data.browserToken = currentToken;
                                    });
                            }, function (error) {
                                dfc.data.status = 'User denied permissions to show notifications.';
                            });
                    }
                }, function (error) {

                });
        };

        dfc.deleteToken = function deleteToken(token) {
            ngFcmService.deleteToken(token)
                .then(function () {
                    dfc.data.browserToken = '';
                    dfc.data.serverToken = '';
                    dfc.data.status = 'Token not set';
                    dfc.notification = {};
                })
        };

        dfc.sendNotification = function sendNotification(notification, token, delayed, serverToken) {
            if (delayed) {
                $timeout(function () {
                    demoTestService.send(notification, token, serverToken);
                }, 10000);
            } else {
                demoTestService.send(notification, token, serverToken);
            }
        };

        $scope.$on('ngFcm.messageReceived', function (event, data) {
            dfc.data.notification = data.notification;
        });
    }


    function demoTestService($http) {

        this.send = function send(notification, tokenDestination, serverToken) {
            if (!notification) {
                notification = {
                    notification: {
                        title: 'Chile vs. Denmark',
                        text: '5 to 1',
                        'click_action': 'https://google.com'
                    },
                    to: tokenDestination
                };
            }

            return $http.post('https://fcm.googleapis.com/fcm/send',
                notification, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'key=' + serverToken
                    }
                });
        };
    }
})();