'use strict';

angular.module('myuow')
.service('AuthService', function ($rootScope, $q, $http, serverAddress, $location, $modal, FlashService) {

    $rootScope.auth = {
        enticated: false,
        credentials: {},
        username: ''
    };
    this.getCredentials = function () {
        var creds = formPostEncode($rootScope.auth.credentials);
        return creds;
    }
    this.login = function (username, password) {
        var q = $q.defer();
        $http.post(serverAddress + "/account/login", {
                username: username,
                password: password
        }).then(function (data) {
            if (data.status === 200) {
                $rootScope.auth.enticated = true;
                $rootScope.auth.credentials = data.data;
                sessionStorage.credentials = JSON.stringify(data.data);
                localStorage.username = $rootScope.auth.username = username;
                q.resolve($rootScope.auth);
            } else {
                q.reject(data);
            }
        }, function (data) {
            data.data = data.data;
            q.reject(data);
        });
        return q.promise;
    };
    this.logout = function () {
        delete sessionStorage.credentials;
        delete localStorage.username;
        $rootScope.auth.enticated = false;
        location.href = '#/';
        location.reload();
    }
    this.ensureLogin = function () {
        var modal = $modal.open({
            templateUrl: 'views/login.html',
            controller: 'LoginController',
        });
        var ticket = $rootScope.$watch('auth.enticated', function (val, old) {
            if (val) {
                modal.close();
                ticket();
            }
        });
    }

    if (sessionStorage.credentials) {
        var self = this;
        $rootScope.auth.credentials = JSON.parse(sessionStorage.credentials);
        $rootScope.auth.username = localStorage.username;
        $rootScope.auth.enticated = true;
        $http.get(serverAddress + '/account/check?' + this.getCredentials()).then(angular.noop);
    }
});
