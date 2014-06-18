'use strict';

angular.module('myuow')
.controller('TimetableController', function ($scope, $routeParams, $location, $http, serverAddress, AuthService) {
    var params = $routeParams;
    angular.extend($scope, params);
    $http.get(serverAddress +'timetable/search/' + params.code +'?year='+ params.year).then(function (data) {
        $scope.subjects = data.data;
    });

    $scope.subjectData = {};
    $scope.pullSubject = function (id) {
        $http.get(serverAddress +'timetable/id/' + id).then(function (data) {
            var classes = data.data.classes;
            data.data.classes = _.sortBy(_.map(classes, function (classes, name) { return {name: name, classes: classes}; }), 'name');
            $scope.subjectData[id] = data.data;
        });
    };

    var movePage = _.debounce(function () {
        if (($scope.code != params.code || $scope.year != params.year) && $scope.code && $scope.year) {
            $location.path('/timetable/'+ $scope.year +'/'+ $scope.code);
            $location.replace();
            $scope.$apply();
        }
    }, 500);
    $scope.$watch('code', movePage);
    $scope.$watch('year', movePage);
});
