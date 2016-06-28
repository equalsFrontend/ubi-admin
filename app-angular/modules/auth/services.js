'use strict';

var Authentication = angular.module('genie.auth.services',[])
    .factory('AuthInterceptor', ['$q', '$rootScope', '$cookieStore', '$location','$injector', function($q, $rootScope, $cookieStore, $location, $injector){

        return {
            'responseError': function(rejection) {
                function updateUrlParameter(uri, key, value) {
                    // remove the hash part before operating on the uri
                    var i = uri.indexOf('#');
                    var hash = i === -1 ? ''  : uri.substr(i);
                    uri = i === -1 ? uri : uri.substr(0, i);

                    var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
                    var separator = uri.indexOf('?') !== -1 ? "&" : "?";
                    if (uri.match(re)) {
                        uri = uri.replace(re, '$1' + key + "=" + value + '$2');
                    } else {
                        uri = uri + separator + key + "=" + value;
                    }
                    return uri + hash;  // finally append the hash as well
                }

                var AuthenticationService = $injector.get("AuthenticationService");

                var $http = $injector.get('$http');

                if((rejection.status == 401 || rejection.status == -1) && rejection.data.message.indexOf('expired') > -1)
                {


                    return($q.resolve(AuthenticationService.refreshToken()).then(function(result){

                        var response = result.data;

                        AuthenticationService.setSession(response.user.username, response.token, response.refreshToken, response.user);

                        rejection.config.url = updateUrlParameter(rejection.config.url,'token',response.token);

                        var $http = $injector.get('$http');
                        return $q.resolve($http(rejection.config)).then(function(result){
                            return result.data;
                        });
                    }, function(response){
                        AuthenticationService.clearSession();

                        $state.go('dashboard.participants.search.validation');

                        //var path = $rootScope.path('loginController');
                        //$location.path( path );

                        return $q.reject(rejection);
                    }, function(response){
                        return "progress callback";
                    }));
                }else{

                    if(rejection.data.message.indexOf('expired') > -1) {
                        AuthenticationService.clearSession();

                        $state.go('dashboard.participants.search.validation');

                    }
                    return $q.reject(rejection);
                }
            }
        };
    }])
.factory('AuthenticationService', ['$translate', '$base64', '$http', 'localStorageService', '$rootScope', '$timeout','APP_CONFIG', '$state', function ($translate, $base64, $http, localStorageService, $rootScope, $timeout, configs, $state) {
    var service = {};
    var errorMessage;

    service.checkLogin = function(external)
    {
        var credentials = this.getSession();

        if(!credentials || $.isEmptyObject(credentials)){
            //this.errorMessage = "Veuillez vous connecter.";
            return false;
        }

        if(external && !credentials.currentUser.remember){
            console.log("refreshing and didn't hit 'remember me' ");
            return false;
        }

        if(!this.checkRole()){
            this.errorMessage = $translate.instant('AUTH.LOGIN_ERROR');
            return false;
        }

        return (credentials && !$.isEmptyObject(credentials) && this.checkRole());
    };

    service.checkRole = function()
    {
        var credentials = this.getSession();

        if(undefined == credentials.currentUser.authdata.roles){
            return false;
        }

        var roles = credentials.currentUser.authdata.roles;

        var found = false;
        roles.forEach( function(role){

            if(role.name == 'admin'){
                found = true;
            }
        });

        return found;
    };

    service.login = function (username, password, remember, callback) {

        var thisService = this;

        $http.post(configs.apiBaseUrl + '/userdepot/'+ configs.realmName +'/sessions', { username: username, password: password })
        .success(function (response) {

            if(remember != 1){
                remember = false;
            }

            thisService.setSession(response.user.username, response.token, response.refreshToken, response.user, remember);

            callback(response);
        })
        .error(function (response, data, status, header) {

            thisService.errorMessage = $translate.instant('AUTH.LOGIN_ERROR');

            callback(response);
        });

    };

    service.getGlobals = function(){
        //console.log($rootScope.globals);
        if(!$rootScope.globals){
            service.kill();
        } else {
            return $rootScope.globals;
        }
    };

    service.refreshing = false;
    service.refreshPromise = null;

    service.refreshToken = function(){
        var thisService = this;

        var credentials = this.getSession();

        if(!this.refreshPromise)
        {
            this.refreshPromise = $http.put(configs.apiBaseUrl + '/userdepot/'+ configs.realmName +'/sessions', { refreshToken: credentials.currentUser.refreshToken });
        }

        return this.refreshPromise;

    };

    service.setSession = function(username, token, refreshToken, authdata, remember){
        $rootScope.globals = {
            currentUser: {
                username: username,
                token: token,
                refreshToken: refreshToken,
                authdata: authdata,
                remember: remember
            }
        };

        var sessionString = $base64.encode(JSON.stringify($rootScope.globals));

        localStorageService.set("session", sessionString);

        this.refreshPromise = null;

        return sessionString;
    };

    service.getSession = function(){
        if(!$rootScope.globals){
            if(localStorageService.get('session') != null){
                $rootScope.globals = JSON.parse($base64.decode(localStorageService.get('session')));
            } else {
                return false;
            }
        }

        return $rootScope.globals;
    };

    service.kill = function(){
        service.clearSession();
        $state.go('login');
    };

    service.clearSession = function(){
        $rootScope.globals = null;
        localStorageService.remove('session');
    };

    return service;
}]);