'use strict';

angular.module('genie.participants.controllers',[])

.controller("participantsProfileController", ['$translate', '$scope','$state', '$injector', 'ParticipantProfileService','$rootScope','$mdDialog', '$filter','growl','$timeout', 'ParticipantsSearchConfig', function($translate, $scope, $state, $injector, ParticipantProfileService, $rootScope, $mdDialog, $filter, growl, $timeout, ParticipantsSearchConfig){
    var username = $state.params.username;

    function ready(){
        $timeout(function(){
            $('.profile-panel').addClass('active');
        }, 500);
    }

    ParticipantProfileService.getResource().getByUsername({username:username}).$promise.then(function(data){
        $scope.participant = data;

        if(data.user.addresses.length > 0){
            $scope.address = data.user.addresses[0];
        }

        ParticipantProfileService.getResource().getMachinesByUsername({username:username}).$promise.then(function(data){

            if(data.length > 0){
                $scope.machine = data[data.length-1];
            }

            ready();
        }, function(){
            ready();
        });

        $scope.canChangeStatus = function(type){
            var canValidate = false;
            var status = $scope.participant.status;
            var permittedStatus = {
                validate : ["SUBSCRIBED", "UNSUBSCRIBED", "REFUSED"],
                refuse : ["SUBSCRIBED"],
                unsubscribe : ["VALIDATED"],
                delete : [ "SUBSCRIBED", "REFUSED"]
            };

            if(status){
                return (permittedStatus[type].indexOf(status) > -1);
            }

            return false;
        }

    },function(data){
        $mdDialog.show(
            $mdDialog.alert()
                .title($translate.instant('DIALOG.ALERT.NOT_FOUND.TITLE'))
                .htmlContent($translate.instant('DIALOG.ALERT.NOT_FOUND.PARTICIPANT'))
                .ok($translate.instant('DIALOG.ALERT.OK'))
        ).then(function () {
            $state.go($rootScope.previousState);
        });
    });

    $scope.save = function(){

        $scope.saveParticipant();
        $scope.saveAddress();

    };

    $scope.saveParticipant = function(){
        $scope.formParticipant.$setSubmitted();

        if( $scope.formParticipant.$valid && $scope.formParticipant.$dirty ){
            ParticipantProfileService.getResource().saveParticipant($scope.participant).$promise.then(function(){

                $scope.formParticipant.$setPristine();
                growl.success($translate.instant('DIALOG.ALERT.SAVE.SUCCESS.PARTICIPANT'));

            }, function(){

                $mdDialog.show(
                    $mdDialog.alert()
                        .title($translate.instant('DIALOG.ALERT.SAVE.ERROR.TITLE'))
                        .textContent($translate.instant('DIALOG.ALERT.SAVE.ERROR.PARTICIPANT'))
                        .ok($translate.instant('DIALOG.ALERT.OK'))
                );
            });
        }
    }

    $scope.saveAddress = function(){
        $scope.formAddress.$setSubmitted();

        if(( $scope.formAddress.$valid ) && $scope.formAddress.$dirty){
            var params = angular.extend($scope.address, {username : $scope.participant.user.username});
            ParticipantProfileService.getResource().saveAddress(params).$promise.then(function(data){

                $scope.formAddress.$setPristine();
                growl.success($translate.instant('DIALOG.ALERT.SAVE.SUCCESS.ADDRESS'));

            },function(){
                $mdDialog.show(
                    $mdDialog.alert()
                        .title($translate.instant('DIALOG.ALERT.SAVE.ERROR.TITLE'))
                        .textContent($translate.instant('DIALOG.ALERT.SAVE.ERROR.ADDRESS'))
                        .ok($translate.instant('DIALOG.ALERT.OK'))
                );
            });
        }
    };

    $scope.confirmStatusChange = function(status){

        var action = ParticipantsSearchConfig.actions[status];
        $mdDialog.show(
            $mdDialog.confirm({
                onShowing: function(scope, element, options, controller) {

                    //overwriting default onShowing function

                    if (controller) {
                        controller.mdHtmlContent = controller.htmlContent || options.htmlContent || '';
                        controller.mdTextContent = controller.textContent || options.textContent ||
                            controller.content || options.content || '';

                        $timeout(function(){
                            $('md-dialog').addClass(status);
                        }, 50);

                        if (controller.mdHtmlContent && !$injector.has('$sanitize')) {
                            throw Error('The ngSanitize module must be loaded in order to use htmlContent.');
                        }

                        if (controller.mdHtmlContent && controller.mdTextContent) {
                            throw Error('md-dialog cannot have both `htmlContent` and `textContent`');
                        }
                    }
                }
            })
            .title($translate.instant('PARTICIPANTS.ACTIONS.' + action.id.toUpperCase()))
            .htmlContent($translate.instant('DIALOG.CONFIRM.ACTION.ARE_YOU_SURE') + " <span>" + $translate.instant('PARTICIPANTS.ACTIONS.' + action.id.toUpperCase()).toLowerCase() + "</span> " + $translate.instant('DIALOG.CONFIRM.ACTION.THE_PARTICIPANT') + " " + username + "?")

            //TODO: make format work
            //.htmlContent($translate.instant('DIALOG.CONFIRM.ACTION').format($translate.instant('PARTICIPANTS.ACTIONS.' + action.id.toUpperCase()).toLowerCase()))

            .ok($translate.instant('DIALOG.CONFIRM.ACTION.YES'))
            .cancel($translate.instant('DIALOG.CONFIRM.ACTION.NO'))

        ).then(function(){
            ParticipantsSearchConfig.commands.performAction($scope.participant.user.username, status).then(function(){
                $scope.participant.status = action.status;

                growl.success($translate.instant('DIALOG.ALERT.ACTION.SUCCESS'));

                if(status == 'delete'){
                    $state.go($rootScope.previousState);
                }

            }, function(){
                $mdDialog.show(
                    $mdDialog.alert()
                    .title($translate.instant('DIALOG.ALERT.ACTION.ERROR.TITLE'))
                    .textContent($translate.instant('DIALOG.ALERT.ACTION.ERROR.DETAIL'))
                    .ok($translate.instant('DIALOG.ALERT.OK'))
                );
            });
        });
    };

}])
.controller('participantsRefuseController',['$state', '$scope', '$location', 'AbstractSearchService', 'ParticipantsSearchConfig', 'BatchService', function($state, $scope, $location, AbstractSearchService, ParticipantsSearchConfig, BatchService){

    $scope.batchActions = {
        validate : {
            id: 'validate',
            title: 'Revalider'
        },
        delete : {
            id: 'delete',
            title: 'Supprimer'
        }
    };
    BatchService.setBatchActions($scope.batchActions);
    $scope.batchList = [];

    AbstractSearchService.configure(ParticipantsSearchConfig);
    AbstractSearchService.setFilter({
        "participantStatusList": ["REFUSED"]
    });
    AbstractSearchService.setResultsElement($('#datatable'));
    AbstractSearchService.fetch().then(function(data){
        $scope.searchResults = data;
        $scope.pages = AbstractSearchService.pages;
    });
}])
.controller('participantsDesaController',['$state', '$scope', '$location', 'AbstractSearchService', 'ParticipantsSearchConfig', 'BatchService', function($state, $scope, $location, AbstractSearchService, ParticipantsSearchConfig, BatchService){

    $scope.batchActions = {
        validate : {
            id: 'validate',
            title: 'Revalider'
        }
    };
    BatchService.setBatchActions($scope.batchActions);
    $scope.batchList = [];

    AbstractSearchService.configure(ParticipantsSearchConfig);
    AbstractSearchService.setFilter({
        "participantStatusList": ["UNSUBSCRIBED"]
    });
    AbstractSearchService.setResultsElement($('#datatable'));
    AbstractSearchService.fetch().then(function(data){
        $scope.searchResults = data;
        $scope.pages = AbstractSearchService.pages;
    });
}])
.controller('participantsSuiviController',['$state', '$scope', '$location', 'AbstractSearchService', 'ParticipantsSearchConfig', 'BatchService', function($state, $scope, $location, AbstractSearchService, ParticipantsSearchConfig, BatchService){

    $scope.batchActions = {
        unsubscribe : {
            id: 'unsubscribe',
            title: 'Désabonner'
        }
    };
    BatchService.setBatchActions($scope.batchActions);
    $scope.batchList = [];

    AbstractSearchService.configure(ParticipantsSearchConfig);
    AbstractSearchService.setFilter({
        "participantStatusList": ["VALIDATED"]
    });
    AbstractSearchService.setResultsElement($('#datatable'));
    AbstractSearchService.fetch().then(function(data){
        $scope.searchResults = data;
        $scope.pages = AbstractSearchService.pages;
    });
}])
.controller('participantsValiController',['$state', '$scope', '$location', 'AbstractSearchService', 'ParticipantsSearchConfig', 'BatchService', function($state, $scope, $location, AbstractSearchService, ParticipantsSearchConfig, BatchService){

    $scope.batchActions = {
        validate : {
            id: 'validate',
            title: 'Valider'
        },
        refuse : {
            id: 'refuse',
            title: 'Refuser'
        },
        delete : {
            id: 'delete',
            title: 'Supprimer'
        }
    };
    BatchService.setBatchActions($scope.batchActions);
    $scope.batchList = [];

    AbstractSearchService.configure(ParticipantsSearchConfig);
    AbstractSearchService.setFilter({
        "participantStatusList": ["SUBSCRIBED"]
    });
    AbstractSearchService.setResultsElement($('#datatable'));
    AbstractSearchService.fetch().then(function(data){
        $scope.searchResults = data;
        $scope.pages = AbstractSearchService.pages;
    });

}]);