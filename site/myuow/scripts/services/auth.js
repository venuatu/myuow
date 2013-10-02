'use strict';

angular.module('myuow')
.service('AuthService', function ($rootScope, $q, $http, serverAddress, $location) {

    $rootScope.auth = {
        enticated: false,
        id: '',
        username: ''
    };
    if (localStorage.id) {
        $rootScope.auth.id = localStorage.id;
        $rootScope.auth.username = localStorage.username;
        $rootScope.auth.enticated = true;
        $http.get(serverAddress + '/checkauth?session=' + $rootScope.auth.id).then(function (data) {
        }, function (data) {
        });
    }

    this.login = function (username, password) {
        var q = $q.defer();
        $http.post(serverAddress + "/login", {
                username: username,
                password: password
        }).then(function (data) {
            if (data.status === 201) {
                $rootScope.auth.enticated = true;
                localStorage.id = $rootScope.auth.id = JSON.parse(data.data);
                localStorage.username = $rootScope.auth.username = username;
                q.resolve($rootScope.auth);
            } else {
                q.reject(data);
            }
        }, function (data) {
            data.data = JSON.parse(data.data);
            q.reject(data);
        });
        return q.promise;
    };
    this.logout = function () {
        delete localStorage.id;
        delete localStorage.username;
        $rootScope.auth.enticated = false;
        location.href = '#/';
        location.reload();
    }

});
