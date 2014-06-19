'use strict';

angular.module('myuow')
.controller('NavController', function ($rootScope, $http, AuthService, serverAddress, $location) {
    $rootScope.moodle = function () {
        window.open(serverAddress + '/moodle?' + AuthService.getCredentials(), "_blank");
    };
    $rootScope.login = function () {
        AuthService.ensureLogin();
    }
    $rootScope.logout = function () {
        AuthService.logout();
    }

    $rootScope.currentYear = (new Date()).getFullYear();

    $rootScope.campuses = [];
    $http.get(serverAddress + '/campuses').then(function (data) {
        $rootScope.campuses = data.data;
        $rootScope.campus = $rootScope.campuses['Wollongong']
    });

    $rootScope.$watch('auth.enticated', function (val, old) {
        if (val) {
            $http.get(serverAddress + '/yank/menu?' + AuthService.getCredentials()).then(function (data) {
                $rootScope.links = data.data;
            });

            // Don't go to the default page if we're on another page
            var defaultPath = '/frame/';
            if ($location.path() === defaultPath) {
                $rootScope.timetable();
            }
        }
    });

});
