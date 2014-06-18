'use strict';

angular.module('myuow')
.controller('YankController', function ($scope, $routeParams, serverAddress, $http, $sce) {
    if ($routeParams.page === undefined) {
        $routeParams.page = '/404';
    }
    
    console.log('startrec ', $routeParams.page);
    $http.get(serverAddress + "/yank?page=" + $routeParams.page + "&session=" + $scope.auth.id)
        .then(function (data) {
            console.log('recieved ', $routeParams.page);
            data.data = JSON.parse(data.data);
            $scope.page = "data:text/html;charset=utf-8;base64," + btoa(data.data);
        }, function (data) {
            console.log('recievede ', $routeParams.page, data.data);
            $scope.page = "data:text/plain;charset=utf-8;base64," + btoa(JSON.stringify(data.data));
        });
});
