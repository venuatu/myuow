'use strict';

angular.module('myuow')
.controller('DescriptionController', function ($scope, $state, $stateParams, $http, serverAddress) {
    _.extend($scope, $stateParams);
    $scope.params = $stateParams;
    var {code, year} = $stateParams;
    $scope.code = code = code || 'math';
    year = year || (new Date()).getFullYear();

    if (code) {
        $http.get(`${serverAddress}descriptions/search/${code}?year=${year}`).then(function (data) {
            $scope.subjects = data.data;
        });
    }
    
    var addNewlines = (str) => str.replace(/([a-zA-Z])([\.:]) /g, (m, ch, sep) => `${ch}${sep}\n`);

    $scope.descriptions = {};
    $scope.pullDescription = function (subject) {
        if (!$scope.descriptions[subject.id]) {
            $http.get(subject.url.replace('http:', 'https:')).then(function (data) {
                data.data.description = addNewlines(data.data.description);
                data.data.extra = _.map(data.data.extra, addNewlines);
                _.each(data.data.availability, function (item) {
                    item.session.name = item.session.name.replace(item.campus, '').replace(/(DXB UG|SIM|INTI Penang)/, '').trim();
                });
                $scope.descriptions[subject.id] = data.data;
            });
        }
    };

    $scope.search = function (code) {
        console.log(code, $stateParams);
        if (code && code !== $stateParams.code) {
            $state.go('descriptions', {code, year});
        }
    };
});
