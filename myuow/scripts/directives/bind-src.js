'use strict';

angular.module('myuow')
.directive('bindSrc', function ($location) {
    return function (scope, elem, attrs) {
        // A workaround because angular doesn't bind to the src attribute of an iframe
        attrs.$observe('bindSrc', function (val) {
            elem[0].src = attrs.bindSrc;
        });
        scope.$watch('auth.enticated', function (val) {
            elem[0].src = "about:blank";
            elem[0].src = attrs.bindSrc;
        });
    };
});
