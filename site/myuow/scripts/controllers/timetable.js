'use strict';

angular.module('myuow')
.controller('TimetableController', function ($scope, $http, serverAddress) {

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
        columnFormat: {
          week: 'dddd'
        },
    };
    $scope.events = [];

    $scope.$watch('auth.enticated', function (val) {
        if (val) {
            $http.get(serverAddress + '/subject/enrolled?session=' + $scope.auth.id).then(function (data) {
                $http.get(serverAddress + '/fullcalendar?subjects=' + data.data.join(',')).then(function (data) {
                    $scope.events.length = 0;
                    $scope.events.push(data.data);
                });
            });
        }
    })
});
