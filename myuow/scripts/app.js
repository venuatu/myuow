'use strict';

window.formPostEncode = function (obj) {
    return _(obj).map((value, key) =>
        encodeURIComponent(key) + "=" + encodeURIComponent(value)
    ).join('&');
}

angular.module('myuow', ['ui.router', 'ngAnimate', 'ngTouch', 'ui.bootstrap', 'angular-loading-bar'])
.constant('serverAddress', 'https://myuow.me/api/')
.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
    .state('frame', {
        url: '/frame?page',
        templateUrl: 'views/frame.html',
        controller: 'FrameController'
    })
    .state('descriptions', {
        url: '/descriptions/:code',
        templateUrl: 'views/description.html',
        controller: 'DescriptionController'
    })
    .state('timetables', {
        url: '/timetables/:code',
        templateUrl: 'views/timetable.html',
        controller: 'TimetableController'
    })
    .state('about', {
        url: '/about',
        templateUrl: 'views/about.html'
    })
    $urlRouterProvider.otherwise('descriptions/');
})
.config(function ($httpProvider) {  
    $httpProvider.interceptors.push(["$q", "$injector", "FlashService", function ($q, $injector, FlashService) {
        return {
            responseError: function (response) {
                if (response.status === 401) {
                    $injector.get('AuthService').logout();
                } else if (response.status === 404) {
                    FlashService.add('Item not found', 'warning');
                } else if (response.status === 500) {
                    FlashService.add('An error occurred', 'danger');
                }
                return $q.reject(response);
            }
        }
    }]);
})
.config(function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = true;
})
;
