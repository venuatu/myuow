'use strict';

angular.module('myuow')
.controller('DescriptionController', function ($scope, $routeParams, $location, $http, serverAddress) {
    var params = $routeParams;
    angular.extend($scope, params);
    $http.get(serverAddress +'descriptions/search/'+ params.code +'?year='+ params.year).then(function (data) {
        $scope.subjects = data.data;
    });

    function addNewlines(str) {
        return str.replace(/([a-zA-Z])([\.:]) /g, function (m, ch, sep){ return ch + sep +'\n'; });
    }

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
        if ((code !== params.code || year !== params.year) && code) {
            $location.path('/descriptions/'+ params.year +'/'+ code);
        }
    };
});
