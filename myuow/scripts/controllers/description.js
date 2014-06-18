'use strict';

angular.module('myuow')
.controller('DescriptionController', function ($scope, $routeParams, $location, $http, serverAddress) {
    var params = $routeParams;
    angular.extend($scope, params);
    $http.get(serverAddress +'description/search/'+ params.code +'?year='+ params.year).then(function (data) {
        $scope.subjects = data.data;
    });

    function addNewlines(str) {
        return str.replace(/([a-zA-Z])([\.:]) /g, function (m, ch, sep){ return ch + sep +'\n'; });
    }

    $scope.descriptions = {};
    $scope.pullDescription = function (subject) {
        $http.get(subject.url.replace('http:', 'https:')).then(function (data) {
            data.data.description = addNewlines(data.data.description);
            data.data.extra = _.map(data.data.extra, addNewlines);

            $scope.descriptions[subject.id] = data.data;
        });
    };

    var movePage = _.debounce(function () {
        if (($scope.code != params.code || $scope.year != params.year) && $scope.code && $scope.year) {
            $location.path('/descriptions/'+ $scope.year +'/'+ $scope.code);
            $scope.$apply();
        }
    }, 500);
    $scope.$watch('code', movePage);
    $scope.$watch('year', movePage);

});
