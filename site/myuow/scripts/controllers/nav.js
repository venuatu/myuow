'use strict';

angular.module('myuow')
.controller('NavController', function ($scope, $http, AuthService, serverAddress, $location) {
    $scope.moodle = function () {
        window.open(serverAddress + '/moodle?' + AuthService.getCredentials(), "_blank");
    };
    $scope.logout = function () {
        AuthService.logout();
    }
    $scope.$watch('auth.enticated', function (val, old) {
        if (val) {
            $http.get(serverAddress + '/yank/menu?' + AuthService.getCredentials()).then(function (data) {
                $scope.links = data.data;
            });

            // Don't go to the default page if we're on another page
            var defaultPath = '/frame/';
            if ($location.path() === defaultPath) {
                $scope.timetable();
            }
        }
    });

});
