'use strict';

window.formPostEncode = function (obj) {
    var output = "";
    for (var member in obj) {
        output += encodeURIComponent(member) + "=" + encodeURIComponent(obj[member]) + "&";
    }
    return output.slice(0, -1);
}


angular.module('myuow', ['ngRoute', 'ngAnimate', 'ngTouch', 'ui.bootstrap', 'angular-loading-bar'])
.constant('serverAddress', 'https://myuow.me/api/')
.config(function ($routeProvider) {
    $routeProvider
        .when('/frame/:page', {
            templateUrl: 'views/frame.html',
            controller: 'FrameController'
        })
        .when('/descriptions/:year/:code', {
            templateUrl: 'views/description.html',
            controller: 'DescriptionController'
        })
        .when('/timetables/:year/:code', {
            templateUrl: 'views/timetable.html',
            controller: 'TimetableController'
        })
        .when('/about', {
            templateUrl: 'views/about.html'
        })
        .otherwise({
            redirectTo: '/timetables/'+ (new Date()).getFullYear() +'/CSCI'
        });
})
.config(function ($httpProvider) {  
    $httpProvider.interceptors.push(["$q", "$injector", "FlashService", function ($q, $injector, FlashService) {
        return {
            responseError: function (response) {
                if (response.status === 401) {
                    $injector.get('AuthService').logout();
                } else if (response.status === 500) {
                    FlashService.add('An error occurred', 'danger')
                }
                return $q.reject(response);
            }
        }
    }]);
})
.config(function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = true;
})
.run(function ($rootScope, $location) {
    $rootScope.$on('$routeChangeSuccess', function () {
        $rootScope.location = $location.path();
    });
})
;
