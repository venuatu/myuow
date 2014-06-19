'use strict';

angular.module('myuow')
.controller('TimetableController', function ($scope, $routeParams, $location, $http, serverAddress) {
    var params = $routeParams;
    angular.extend($scope, params);
    $http.get(serverAddress +'timetable/search/' + params.code +'?year='+ params.year).then(function (data) {
        $scope.subjects = data.data;
    });

    $scope.subjectData = {};
    $scope.pullSubject = function (id) {
        if (!$scope.subjectData[id]) {
            $http.get(serverAddress +'timetable/id/' + id).then(function (data) {
                var classes = data.data.classes;
                data.data.classes = _.sortBy(_.map(classes, function (classes, name) { return {name: name, classes: classes}; }), 'name');
                $scope.subjectData[id] = data.data;
            });
        }
    };

    $scope.search = function (code, year) {
        if ((code != params.code || year != params.year) && code) {
            $location.path('/timetables/'+ params.year +'/'+ code);
        }
    };
});
