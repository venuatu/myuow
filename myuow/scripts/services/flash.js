'use strict';

angular.module('myuow')
.service('FlashService', function ($rootScope, $timeout) {
    $rootScope.flashes = [];
    $rootScope.popflash = function (index) {
        $rootScope.flashes.splice(index, 1);
    };

    function Flash(message, level, timeout) {
        this.message = message;
        this.level = level;
        if (level == '') {
            this.level = 'info';
        }
        this.timeout = new Date();
        this.timeout.setSeconds(this.timeout.getSeconds() + timeout)
    }
    
    this.add = function (message, level, timeout) {
        if (level === undefined)
            level = '';
        if (timeout === undefined)// seconds
            timeout = 10;

        var flash = new Flash(message, level, timeout);
        $rootScope.flashes.push(flash);

        $timeout(function () {// Clear expired flashes
            var currTime = new Date();
            for (var i = 0; i < $rootScope.flashes.length; i++) {
                if ($rootScope.flashes[i].timeout < currTime) {
                    $rootScope.flashes.splice(i, 1);
                    i--;
                }
            }
        }, timeout * 1000 + 100);
        return flash;
    };
    this.remove = function (flash) {
        for (var i = 0; i < $rootScope.flashes.length; i++) {
            if ($rootScope.flashes[i] === flash) {
                $rootScope.flashes.splice(i, 1);
                return;
            }
        }
    };
    this.clear = function () {
        $rootScope.flashes.length = 0;
    };
})
;