'use strict';

var Authentication = angular.module('genie.auth.controllers',[])

.controller('loginController', ['$state', '$scope', '$rootScope', '$location','AuthenticationService', function ($state, $scope, $rootScope, $location, AuthenticationService) {

    console.log("Login controller");

    if(undefined !== AuthenticationService.errorMessage)
    {
        $scope.error = AuthenticationService.errorMessage;
        AuthenticationService.errorMessage = "";
    }

    if (AuthenticationService.checkLogin(true)) {
        $state.go('dashboard.participants.search.validation');
    }

    $scope.login = function () {

        $scope.error = "";

        AuthenticationService.login($scope.username, $scope.password, $scope.rememberMe, function (response) {

            if (AuthenticationService.checkLogin()) {

                //if(1 == $scope.rememberMe){
                //    AuthenticationService.rememberUser();
                //}

                $state.go('dashboard.participants.search.validation');

            } else {
                $scope.error = AuthenticationService.errorMessage;
            }
        });
    };
}]);