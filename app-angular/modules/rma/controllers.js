'use strict';

angular.module('genie.rma.controllers',[])

.controller('rmaSearchController', ['RMAStepService', '$timeout', '$scope', '$rootScope', '$element', 'AbstractSearchService', 'RMASearchConfig', function(RMAStepService, $timeout, $scope, $rootScope, $element, AbstractSearchService, RMASearchConfig){
    AbstractSearchService.configure(RMASearchConfig);
    AbstractSearchService.setFilter({
        "fulfillmentTypeList": ["RMA"]
    });
    AbstractSearchService.setResultsElement($('#datatable'));
    AbstractSearchService.fetch().then(function(data){
        $scope.searchResults = data;
        $scope.pages = AbstractSearchService.pages;
    });
}])
.controller('rmaDeclareSearchController', ['RMAStepService', '$timeout', '$scope', '$rootScope', '$element', 'AbstractSearchService', 'ParticipantsSearchConfig', function(RMAStepService, $timeout, $scope, $rootScope, $element, AbstractSearchService, ParticipantsSearchConfig){
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
.controller('rmaInfoController', ['RMAStepService', 'RMAService', '$scope', function(RMAStepService, RMAService, $scope){
    RMAStepService.currentStep = 1;

    RMAService.getParticipant().then(function(data){
        $scope.participant = RMAService.participant = data;
    });

    RMAService.getMachine().then(function(data){
        $scope.machine = RMAService.machine = data;
    });

    RMAService.getAddress().then(function(data){
        $scope.address = RMAService.address = data;
    });
}])
.controller('rmaValidateController', ['RMAStepService', '$stateParams', 'RMAService','$scope', 'RMAValidationForm', function(RMAStepService, $stateParams, RMAService, $scope, RMAValidationForm){
    RMAStepService.currentStep = 2;

    if(!RMAService.packaging){
        RMAService.packaging = {};
    }
    $scope.packaging = RMAService.packaging;
    $scope.errorMessages = RMAValidationForm.errorMessages;

}])
.controller('rmaConfirmController', ['$rootScope', '$scope', '$state', 'RMAStepService','RMAService','$stateParams', function($rootScope, $scope, $state, RMAStepService, RMAService, $stateParams){
    RMAStepService.currentStep = 3;

    if(!RMAService.packaging){
        $state.go('dashboard.rma.declare.validate', { user: $state.params.user, MID:$state.params.MID });
    }

    $scope.packaging = RMAService.packaging;

    RMAService.getParticipant().then(function(data){
        $scope.participant = RMAService.participant = data;
    });

    RMAService.getMachine().then(function(data){
        $scope.machine = RMAService.machine = data;
    });

    RMAService.getAddress().then(function(data){
        $scope.address = RMAService.address = data;
    });

}])
.controller('rmaDeclareController',['RMAStepService','RMAsService', 'RMAService', '$scope', '$state', '$rootScope','$stateParams', 'RMAValidationForm','$mdDialog', '$translate', 'ErrorService','growl', 'AbstractSearchService', function(RMAStepService,RMAsService,RMAService, $scope, $state, $rootScope, $stateParams, RMAValidationForm, $mdDialog, $translate, ErrorService, growl, AbstractSearchService){

    $scope.steps = RMAsService.steps;
    $scope.service = AbstractSearchService;

    $scope.verification = [];
    $scope.participantsFound = {};
    $scope.packagingTypes = RMAService.packagingTypes;

    if($state.params.user){
        RMAService.username = $state.params.user;
    }

    if($state.params.MID){
        RMAService.MID = $state.params.MID;
    }

    $scope.chooseMachineAndParticipant = function(machine, participant){
        RMAService.reset();
        RMAService.MID = machine.machineIdentifier;
        RMAService.username = $scope.service.unhighlightJSON(participant.user.username);

        //RMAService.machine = machine;
        //RMAService.participant = participant;

        $scope.formDeclare.$setPristine();

        $state.go('dashboard.rma.declare.info', { user: $scope.service.unhighlightJSON(participant.user.username), MID: $scope.service.unhighlightJSON(machine.machineIdentifier) });

        //experiment
        $rootScope.backward = false;
        $('[ui-view="step"]').removeClass('backward');
        $('[ui-view="step"]').addClass('forward');
    };

    $scope.$state = $state;

    $scope.previousStep = function(){
        RMAStepService.currentStep --;

        $state.go('dashboard.rma.declare.' + RMAStepService.steps[RMAStepService.currentStep].id, { user: RMAService.username, MID:RMAService.MID });

        //experiment
        $rootScope.backward = true;
        $('[ui-view="step"]').removeClass('forward');
        $('[ui-view="step"]').addClass('backward');
    };

    RMAValidationForm.formSubmitted = false;

    $scope.validate = function(){
        $scope.formDeclare.$setSubmitted();

        if($scope.formDeclare.$invalid){
            return false;
        }

        $scope.nextStep('dashboard.rma.declare.confirm');
    };

    $scope.saveInfo = function(){

        $scope.formDeclare.$setSubmitted();

        if($scope.formDeclare.$valid) {
            if($scope.formDeclare.$dirty) {
                $mdDialog.show(
                    $mdDialog.confirm()
                        //.parent(angular.element(document.querySelector('#wrapper')))
                        .title($translate.instant('DIALOG.CONFIRM.RMA.FORM_MODIFIED'))
                        .textContent($translate.instant('DIALOG.CONFIRM.RMA.FORM_MODIFIED_TEXT'))
                        .ariaLabel($translate.instant('DIALOG.CONFIRM.RMA.FORM_MODIFIED'))
                        .ok($translate.instant('DIALOG.CONFIRM.YES'))
                        .cancel($translate.instant('DIALOG.CONFIRM.NO'))
                    //.targetEvent(ev)
                ).then(function(){
                        if(RMAService.saveParticipant()){
                            if(RMAService.saveAddress()){
                                growl.success($translate.instant('DIALOG.CONFIRM.RMA.FORM_SAVED'));
                                $scope.nextStep('dashboard.rma.declare.validate');
                                return true;
                            }
                        }

                        $mdDialog.show(
                            $mdDialog.alert()
                                .title($translate.instant('DIALOG.CONFIRM.RMA.ERROR'))
                                .textContent($translate.instant('DIALOG.CONFIRM.RMA.TRY_AGAIN'))
                                .ok($translate.instant('DIALOG.CONFIRM.YES'))
                        );
                    });
            } else {
                $scope.nextStep('dashboard.rma.declare.validate');
            }
        }
    };

    $scope.gotoStep = function(step, backward, params){

        var defaultParams = { user: RMAService.username, MID:RMAService.MID };
        var finalParams = angular.extend(defaultParams, params)
        $scope.formDeclare.$setPristine();

        //experiment
        $rootScope.backward = backward;

        var state = 'dashboard.rma.declare.' + step;

        $scope.currentStep = step;

        if(backward){
            $state.go(state, finalParams);

            $('[ui-view="step"]').addClass('backward');
            $('[ui-view="step"]').removeClass('forward');
        }else{
            $('[ui-view="step"]').removeClass('backward');
            $('[ui-view="step"]').addClass('forward');

            $state.go(state, finalParams);
        }
    };

    $scope.nextStep = function(state){

        //console.log($scope.formDeclare);
        $scope.formDeclare.$setPristine();

        //experiment
        $rootScope.backward = false;
        $('[ui-view="step"]').removeClass('backward');
        $('[ui-view="step"]').addClass('forward');

        $state.go(state, { user: RMAService.username, MID:RMAService.MID });

    };

    $scope.sendRMA = function() {

        RMAService.send().then(function (result) {
            $mdDialog.show(
                $mdDialog.alert()
                    .title($translate.instant('DIALOG.CONFIRM.RMA.SUCCESS'))
                    .htmlContent('<p>' + $translate.instant('DIALOG.CONFIRM.RMA.ASSOCIATED_MACHINE') + ' "' + RMAService.machine.machineIdentifier + '" ' + $translate.instant('DIALOG.CONFIRM.RMA.DEACTIVATED') + '.</p>' +
                    '<p>' + $translate.instant('DIALOG.CONFIRM.RMA.COMING_SOON') + '</p>')
                    .ok($translate.instant('DIALOG.CONFIRM.OK'))
            ).then(function () {
                RMAService.reset();
                $scope.gotoStep('search',false,{});
            });

        }, function (result) {
            //error
            var title,description;

            console.log(result);

            if (result.data) {
                title = $translate.instant('DIALOG.CONFIRM.RMA.ERROR');
                description = ErrorService.translate(result.data.message);
            } else if (result.status == 500) {
                title = $translate.instant('DIALOG.CONFIRM.RMA.ERROR');
                description = $translate.instant('DIALOG.CONFIRM.RMA.TRY_AGAIN');
            }

            $mdDialog.show(
                $mdDialog.confirm()
                    .title( title )
                    .htmlContent( description )
                    .ok($translate.instant('DIALOG.CONFIRM.YES'))
                    .cancel($translate.instant('DIALOG.CONFIRM.RESTART'))
            ).then(function () {

            }, function () {
                RMAService.reset();
                $scope.gotoStep('search',false,{});
            });

        });
    };
}]);