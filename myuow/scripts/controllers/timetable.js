'use strict';

angular.module('myuow')
.controller('TimetableController', function ($scope, $http, serverAddress, AuthService) {

    $scope.options = {
        header: {
            left: 'none',
            center: 'none',
            right: 'none'
        },
        defaultView: 'agendaWeek',
        editable: false,
        allDaySlot: false,
        weekends: false,
        minTime: '7:00am',
        maxTime: '9:00pm',
        height: 1000,
        columnFormat: {
          week: 'dddd'
        },
    };
    $scope.events = [];

    $scope.$watch('auth.enticated', function (val) {
        if (val) {
            $http.get(serverAddress + '/subjects/enrolled?' + AuthService.getCredentials()).then(function (data) {
                $http.get('https://myuow.me/api/fullcalendar?subjects=' + data.data.join(',')).then(function (data) {
                    $scope.events.length = 0;
                    $scope.events.push(data.data);
                });
            });
        }
    })
});
