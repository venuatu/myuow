'use strict';

angular.module('myuow')
.directive('openIframe', function ($rootScope, $state) {
    return function (scope, elem, attrs) {
        elem.on('click', function (e) {
            if (e.which === 1) {
                e.preventDefault();
                e.stopPropagation();
                scope.$apply(function () {
                    $state.go("frame", {page: attrs.href});
                });
            }
        });
    };
});
