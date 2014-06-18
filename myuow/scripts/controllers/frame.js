'use strict';

angular.module('myuow')
.controller('FrameController', function ($scope, $routeParams, serverAddress, AuthService) {
    AuthService.ensureLog
    if ($routeParams.page === undefined) {
        $routeParams.page = '/404';
        /*serverAddress + "/yank?" + formPostEncode({
            session: $scope.auth.id,
            authLower: true,
            redirect: true,
            extra: 'p_menu_name=MAIN_MENU',
            page: 'sols_menu.display_sols_initial'
        });*/
    }

    $scope.$watch('auth.enticated', function (val) {
        $scope.page = $routeParams.page;        
    });
});
