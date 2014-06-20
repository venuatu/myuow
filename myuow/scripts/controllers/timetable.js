'use strict';

angular.module('myuow')
.controller('TimetableController', function ($scope, $state, $stateParams, $location, $http, serverAddress) {
    _.extend($scope, $stateParams);
    $scope.params = $stateParams;
    var {code, year, campus} = $stateParams;
    $scope.code = code = code || 'math';
    year = year || (new Date()).getFullYear();
    campus = campus || '1';// default: Wollongong

    if (code) {
        $http.get(`${serverAddress}timetables/search/${code}?year=${year}`).then(function (data) {
            $scope.subjects = data.data;
        });
    }
    
    $scope.subjectData = {};
    $scope.pullSubject = function (id) {
        if (!$scope.subjectData[id]) {
            $http.get(`${serverAddress}timetables/id/${id}`).then(function (data) {
                var classes = data.data.classes;
                data.data.classes = _(classes).map((classes, name) => {return {name, classes}})
                                            .sortBy('name').value();
                $scope.subjectData[id] = data.data;
            });
        }
    };

    $scope.search = function (code) {
        if (code && code != $stateParams.code) {
            $state.go('timetables', {code, year, campus});
        }
    };
});
