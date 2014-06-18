'use strict';

angular.module('myuow')
.directive('openIframe', function ($rootScope, $location) {
    return function (scope, elem, attrs) {
        elem.on('click', function (e) {
            if (e.which === 1) {
                e.preventDefault();
                e.stopPropagation();
                scope.$apply(function () {
                    $location.path("/frame/" + encodeURIComponent(attrs.href));
                });
            }
        });
    };
});
