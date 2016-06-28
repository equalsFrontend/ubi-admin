'use strict';

angular.module('genie.sub.controllers',['genie.fulfillments.services', 'genie.vehicles.services'])

.controller('subSearchController', ['$scope', 'AbstractSearchService', 'SubSearchConfig', function($scope, AbstractSearchService, SubSearchConfig){
    AbstractSearchService.configure(SubSearchConfig);
    AbstractSearchService.setFilter({
        "fulfillmentTypeList": ["SUBSTITUTE"]
    });
    AbstractSearchService.setResultsElement($('#datatable'));
    AbstractSearchService.fetch().then(function(data){
        $scope.searchResults = data;
        $scope.pages = AbstractSearchService.pages;
    });
}])
.controller('subDeclareSearchController', ['RMAStepService', '$timeout', '$scope', '$rootScope', '$element', 'AbstractSearchService', 'ParticipantsSearchConfig', function(RMAStepService, $timeout, $scope, $rootScope, $element, AbstractSearchService, ParticipantsSearchConfig){

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
.controller('subConfirmController', ['$scope', 'SubsService', 'Brands', function($scope, SubsService, Brands)
{
    if(!SubsService.newVehicle)
    {
        $scope.gotoStep('vehicle');
    }

    $scope.newVehicle = SubsService.newVehicle;

    SubsService.getParticipant().then(function(data)
    {
        $scope.participant = SubsService.participant = data;
    });

    SubsService.getMachine().then(function(data){
        $scope.machine = SubsService.machine = data;
    });

    SubsService.getAddress().then(function(data){
        $scope.address = SubsService.address = data;
    });

    Brands.resource().query().$promise.then(function(data){
        $scope.brands = data;
    });

}])
.controller('subVehicleController', ['$scope', 'SubsService', 'Brands','$filter', function($scope, SubsService, Brands, $filter)
{
    $scope.years = [];

    var year;
    var maxYear = new Date().getFullYear() + 1;

    for(year=maxYear;year>1960; year--)
    {
        $scope.years.push(year);
    }

    if(!SubsService.newVehicle)
    {
        SubsService.newVehicle = {};
    }

    $scope.newVehicle = SubsService.newVehicle;

    SubsService.getParticipant().then(function(data)
    {
        $scope.participant = SubsService.participant = data;
    });

    SubsService.getMachine().then(function(data){
        $scope.machine = SubsService.machine = data;
    });

    SubsService.getAddress().then(function(data){
        $scope.address = SubsService.address = data;
    });

    Brands.resource().query().$promise.then(function(data){
        $scope.brands = data;
        $scope.refreshModels($scope.newVehicle.brand);
    });

    $scope.$watch('newVehicle.brand', function(newValue) {
        $scope.refreshModels(newValue);
    });

    $scope.refreshModels = function(newValue){
        if(undefined != newValue)
        {
            var found = $filter('filter')($scope.brands, {name: newValue}, true);

            if (found) {
                $scope.models = found[0].modelList;
            } else {
                $scope.models = [];
            }
        }
    }


}])
.controller('subInfoController', ['$scope', 'SubsService', function($scope, SubsService){

    SubsService.getParticipant().then(function(data)
    {
        $scope.participant = SubsService.participant = data;
    });

    SubsService.getMachine().then(function(data){
        $scope.machine = SubsService.machine = data;
    });

    SubsService.getAddress().then(function(data){
        $scope.address = SubsService.address = data;
    });


}])
.controller('subStepSearchController',['$scope', 'ParticipantProfileService', '$timeout', function($scope, ParticipantProfileService, $timeout){

    $scope.lastCallWasBlank = true;
    $scope.to = null;

    $scope.search = function()
    {
        if($scope.query.length < 3) {
            initiateSearchTimeout(true);
        } else {
            initiateSearchTimeout(false);
        }
    };

    $scope.onEnter = function(){

        if($scope.query.length < 3){

            initiateSearchTimeout(true, 1);
        } else {

            initiateSearchTimeout(false, 1);
        }
    };

    function initiateSearchTimeout(blank, duration){

        if(blank && $scope.lastCallWasBlank) return false;

        if($scope.to) $timeout.cancel($scope.to);

        $scope.to = $timeout(function(){

            $('.declare-search').addClass('in-progress');

            ParticipantsService.searchParams.itemsPerPage = 25;
            ParticipantsService.searchParams.currentPage = 1;
            ParticipantsService.searchParams.keyword = $scope.query;
            ParticipantsService.searchParams.statusList = ['VALIDATED'];

            ParticipantsService.fetchParticipants().then(function(data){
                $scope.participantsFound = data;
                $scope.participantsPages = ParticipantsService.pages;

                $('.declare-search').removeClass('in-progress');
            }, function(){
                $scope.participantsFound = [];
                $scope.participantsPages = [];

                $('.declare-search').removeClass('in-progress');
            });

            $scope.lastCallWasBlank = blank;

            $scope.to = null;

        }, (duration ? duration : 1000));
    }
}])
.controller('subDeclareController',['SubsService', '$scope','$state', '$stateParams', '$translate', '$rootScope','$mdDialog', 'ErrorService','growl','AbstractSearchService', function(SubsService, $scope, $state, $stateParams, $translate, $rootScope, $mdDialog, ErrorService,growl, AbstractSearchService){

    $scope.steps = SubsService.steps;
    $scope.service = AbstractSearchService;
    $scope.currentStep = $state.params.currentStep;
    if($state.params.user)
    {
        SubsService.username = $state.params.user;
    }

    if($state.params.MID)
    {
        SubsService.MID = $state.params.MID;
    }

    $scope.chooseMachineAndParticipant = function(machine, participant)
    {
        SubsService.reset();
        SubsService.MID = $scope.service.unhighlightJSON(machine.machineIdentifier);
        SubsService.username = $scope.service.unhighlightJSON(participant.user.username);

        $scope.gotoStep('info',false, { user: SubsService.username, MID:SubsService.MID });
    };

    $scope.gotoPreviousStep = function()
    {
        var nextStep = SubsService.getStepPreceding($scope.currentStep);
        $scope.gotoStep(nextStep.id, true);
    }

    $scope.gotoStep = function(step, backward, params){

        var defaultParams = { user: SubsService.username, MID:SubsService.MID };
        var finalParams = angular.extend(defaultParams, params)
        $scope.formDeclare.$setPristine();

        //experiment
        $rootScope.backward = backward;

        var state = 'dashboard.sub.declare.' + step;

        $scope.currentStep = step;

        if(backward)
        {
            $state.go(state, finalParams);

            $('[ui-view="step"]').addClass('backward');
            $('[ui-view="step"]').removeClass('forward');
        }else{
            $('[ui-view="step"]').removeClass('backward');
            $('[ui-view="step"]').addClass('forward');

            $state.go(state, finalParams);
        }
    };

    $scope.saveInfo = function(){

        $scope.formDeclare.$setSubmitted();

        if($scope.formDeclare.$valid)
        {
            if($scope.formDeclare.$dirty)
            {
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
                    if(SubsService.saveParticipant())
                    {
                        if(SubsService.saveAddress())
                        {
                            growl.success($translate.instant('DIALOG.CONFIRM.RMA.FORM_SAVED'));
                            $scope.gotoStep('vehicle');
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
            }else{
                $scope.gotoStep('vehicle');
            }
        }
    };

    $scope.saveVehicle = function(){

        $scope.formDeclare.$setSubmitted();

        if($scope.formDeclare.$valid)
        {
            $scope.gotoStep('confirm');
        }
    };

    $scope.sendSub = function(){
        SubsService.send().then(function (result) {

            //console.log(SubsService.newVehicle);
            $mdDialog.show(
                $mdDialog.alert()
                    .title($translate.instant('DIALOG.CONFIRM.SUB.SUCCESS'))
                    .htmlContent($translate.instant('DIALOG.CONFIRM.RMA.ASSOCIATED_MACHINE') + ' "' + SubsService.machine.machineIdentifier + '" ' + $translate.instant('DIALOG.CONFIRM.RMA.DEACTIVATED') + ' '
                    + SubsService.newVehicle.brand +' '
                    + SubsService.newVehicle.model +' '
                    + (SubsService.newVehicle.year || '') +'"')
                    .ok($translate.instant('DIALOG.CONFIRM.OK'))
            ).then(function () {
                    SubsService.reset();
                    $scope.gotoStep('search',true, {});
                });

        }, function (result) {

            var title,description;

            if (result.data) {
                title = $translate.instant('DIALOG.CONFIRM.RMA.ERROR');
                description = ErrorService.translate(result.data.message)
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
                    SubsService.reset();
                    $scope.gotoStep('search',true,{});
                });

        });
    };
}]);