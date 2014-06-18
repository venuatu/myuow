'use strict';

angular.module('myuow')
.service('AuthService', function ($rootScope, $q, $http, serverAddress, $location) {

    $rootScope.auth = {
        enticated: false,
        credentials: {},
        username: ''
    };
    this.getCredentials = function () {
        var creds = formPostEncode($rootScope.auth.credentials);
        console.log(creds);
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
                localStorage.credentials = JSON.stringify(data.data);
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
        delete localStorage.credentials;
        delete localStorage.username;
        $rootScope.auth.enticated = false;
        location.href = '#/';
        location.reload();
    }

    if (localStorage.credentials) {
        $rootScope.auth.credentials = JSON.parse(localStorage.credentials);
        $rootScope.auth.username = localStorage.username;
        $rootScope.auth.enticated = true;
        $http.get(serverAddress + '/account/check?' + this.getCredentials()).then(function (data) {
        }, function (data) {
        });
    }
});