'use strict';

angular.module('imetrik-app.controllers',[])

.controller('NavController', ['AuthenticationService', '$timeout', '$state', '$scope', function(AuthenticationService, $timeout, $state, $scope){
    $scope.logout = function(){
        AuthenticationService.clearSession();
        $timeout(function(){
            $state.go('login');
        }, 10);
    }
}])

.controller('MainController',['$rootScope', '$scope', '$state', '$mdDialog', 'Brands', 'Models', 'BatchService', '$translate', function($rootScope, $scope, $state, $mdDialog, Brands, Models, BatchService, $translate) {

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){

        //if coming from list
        // AND we have a batch list
        // AND we are not going to the batch page
        if(fromState.name.indexOf('search') > -1 && BatchService.batchList.length > 0 && toState.name.indexOf('batch') < 0){

            event.preventDefault();

            promptStateChange(toState, toParams, listChangesConfirm);
        }

        //if coming from batch section
        // AND not going to another batch page
        // AND batchlist hasn't be cleaned yet
        // AND it's we're not just returning to the same list
        if(fromState.name.indexOf('batch') > -1 && toState.name.indexOf('batch') < 0 && BatchService.batchList.length > 0 && toState.name != $rootScope.previousState){

            event.preventDefault();

            promptStateChange(toState, toParams, listChangesConfirm);
        }

        //if coming from profile section
        // AND not going to other profile section
        // AND form has a dirty field
        if(fromState.name.indexOf('profile') > -1 && toState.name.indexOf('profile') < 0 && $('.ng-dirty').length > 0) {

            event.preventDefault();

            promptStateChange(toState, toParams, profileChangesConfirm);
        }

    });

    var listChangesConfirm = $mdDialog.confirm()
        .title($translate.instant('DIALOG.CONFIRM.PAGE_CHANGE.TITLE'))
        .textContent($translate.instant('DIALOG.CONFIRM.PAGE_CHANGE.LIST'))
        .ok($translate.instant('DIALOG.CONFIRM.YES'))
        .cancel($translate.instant('DIALOG.CONFIRM.NO'));

    var profileChangesConfirm = $mdDialog.confirm()
        .title($translate.instant('DIALOG.CONFIRM.PAGE_CHANGE.TITLE'))
        .textContent($translate.instant('DIALOG.CONFIRM.PAGE_CHANGE.PROFILE'))
        .ok($translate.instant('DIALOG.CONFIRM.YES'))
        .cancel($translate.instant('DIALOG.CONFIRM.NO'));

    function promptStateChange(toState, toParams, confirmDialog){

        $mdDialog.show(confirmDialog).then(function(){

            BatchService.removeAll();

            $('#datatable input').attr('ng-checked', false);

            $('.ng-dirty').removeClass('ng-dirty');

            $state.go(toState.name, toParams);
        });
    }

    $rootScope.$on('$stateChangeSuccess', function(ev, to, toParams, from, fromParams) {
        $rootScope.previousState = from.name;
    });

    $rootScope.fetchBrands = function(){
        if(typeof $rootScope.allbrandsResource === 'undefined') {
            $rootScope.allbrandsResource = [];
            Brands.query().$promise.then(function(results){
                $rootScope.allbrandsResource = results.data;
                return $rootScope.allbrandsResource;
            });
        } else {
            return $rootScope.allbrandsResource;
        }
    };

    $rootScope.fetchModels = function(){
        if(typeof $rootScope.allmodelsResource === 'undefined') {
            $rootScope.allmodelsResource = [];
            Models.query().$promise.then(function(results){
                $rootScope.allmodelsResource = results.data;
                return $rootScope.allmodelsResource;
            });
        } else {
            return $rootScope.allmodelsResource;
        }
    };

    $rootScope.getBrandNameById = function(id){
        var models = $rootScope.allbrandsResource.filter(function (data) {
            return id == data.id;
        });

        if(models.length > 0) {
            return models[0].name;
        }
    };

    $rootScope.getModelNameById = function(id){
        var models = $rootScope.allmodelsResource.filter(function (data) {
            return id == data.id;
        });

        if(models.length > 0) {
            return models[0].name;
        }
    };
}]);

