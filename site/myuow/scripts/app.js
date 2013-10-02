'use strict';

window.formPostEncode = function (obj) {
    var output = "";
    for (var member in obj) {
        output += encodeURIComponent(member) + "=" + encodeURIComponent(obj[member]) + "&";
    }
    return output.slice(0, -1);
}


angular.module('myuow', ['ngRoute', 'ngAnimate', 'ngTouch', 'ui.bootstrap', 'ui.calendar', 'chieffancypants.loadingBar'])
.constant('serverAddress', 'https://uow.venuatu.me/api')
.config(function ($routeProvider) {
    $routeProvider
        .when('/frame/:page', {
            templateUrl: 'views/frame.html',
            controller: 'FrameController'
        })
        .when('/timetable', {
            templateUrl: 'views/timetable.html',
            controller: 'TimetableController'
        })
        .when('/about', {
            templateUrl: 'views/about.html'
        })
        .otherwise({
            redirectTo: '/timetable'
        });
})
.config(function ($httpProvider) {  
    $httpProvider.interceptors.push(["$q", "$injector", function ($q, $injector) {
        return {
            responseError: function (response) {
                if (response.status === 401) {
                    $injector.get('AuthService').logout();
                }
                return $q.reject(response);
            }
        }
    }]);
})
.config(function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = true;
})
.run(function ($rootScope, $modal, AuthService) {
    if (!$rootScope.auth.enticated) {
        var modal = $modal.open({
            templateUrl: 'views/login.html',
            controller: 'LoginController',
            backdrop: 'static',
            keyboard: false
        });
        $rootScope.$watch('auth.enticated', function (val, old) {
            if (val) {
                modal.close();
            }
        });
    }
})
;
