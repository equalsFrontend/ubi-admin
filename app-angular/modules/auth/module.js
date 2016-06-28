'use strict';

var Authentication = angular.module('genie.auth',[
    'genie.auth.controllers',
    'genie.auth.services',
    'genie.auth.directives',
    'ngCookies'
])

.run( ['$rootScope', '$location', 'AuthenticationService', '$http', '$state', function($rootScope, $location, AuthenticationService, $http, $state) {
    // register listener to watch route changes
    $rootScope.$on( "$stateChangeStart", function(event, next, current) {

        //console.log(current);
        if ( next.name == "login" ) {

            if (AuthenticationService.checkLogin(true)) {
                $state.go('dashboard.participants.search.validation');
            }

            if (undefined == current)
            {
                AuthenticationService.errorMessage = "";
            }

            // already going to #login, no redirect needed
        } else {

            if(!AuthenticationService.checkLogin())
            {
                // not going to #login, we should redirect now
                $state.go('login');

                //}else{
                //$http.defaults.headers.common['Authorization'] = 'Bearer ' + $rootScope.globals.currentUser.token;
            }
        }
    });

    // register listener to watch route changes
    $rootScope.$on( "$stateChangeSuccess", function(event, next, current) {

        var credentials = AuthenticationService.getSession();
        if(credentials && credentials.currentUser)
        {
            $rootScope.user = credentials.currentUser.authdata;
        }
    });
 }])
;