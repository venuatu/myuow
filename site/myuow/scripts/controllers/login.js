'use strict';

angular.module('myuow')
.controller('LoginController', function ($scope, AuthService) {

    $scope.login = function (username, password) {
        $scope.reason = '';
        $scope.working = true;
        AuthService.login(username, password)
        .then(function (data) {
            // we should be closed elsewhere.
        }, function (data) {
            $scope.working = false;
            $scope.reason = data.data;
        });
    };

});
