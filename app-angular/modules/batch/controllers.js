'use strict';

angular.module('genie.batch.controllers',[])

.controller('batchController',['$state', '$rootScope', '$scope', 'BatchService', 'ErrorService', 'ParticipantsSearchConfig', function($state, $rootScope, $scope, BatchService, ErrorService, ParticipantsSearchConfig) {

    $scope.$state = $state;

    $scope.batchList = BatchService.batchList;
    $scope.service = BatchService;

    if($scope.batchList.length == 0) {
        if($rootScope.previousState) {
            $state.go($rootScope.previousState);
        } else {
            $state.go('dashboard.participants.search.validation');
        }
    }

    $scope.requestsComplete = false;
    $scope.requestStarted   = false;
    $scope.requestIndex     = 0;
    $scope.successes        = 0;
    $scope.fails            = 0;

    //essentially a time controlled forEach
    $scope.doBatchAction = function() {

        $scope.requestsStarted = true;
        $scope.batchAction = BatchService.currentAction;

        var username = $scope.batchList[$scope.requestIndex];

        ParticipantsSearchConfig.commands.performAction(username, $scope.batchAction.id).then(function(){

            //success
            $('#batch-item-' + username).addClass('success');
            $('#batch-item-' + username + ' i').addClass('fa fa-check');
            $('#batch-item-' + username + ' span.error').html("OK");

            requestCompleteHandler();

        }, function(rejectObj){

            //fail
            $('#batch-item-' + username).addClass('failed');
            $('#batch-item-' + username + ' i').addClass('fa fa-times');
            $('#batch-item-' + username + ' span.error').html(ErrorService.translate(rejectObj.data.message));

            requestCompleteHandler();

        });
    };

    function requestCompleteHandler(){

        //if not the last request, fire for the next req
        if($scope.requestIndex < $scope.batchList.length - 1){
            $scope.requestIndex++;
            $scope.doBatchAction();
        }

        if($scope.requestIndex == $scope.batchList.length - 1){
            $scope.requestsComplete = true;

            BatchService.removeAll();
        }
    };

    $scope.exitBatchClickHandler = function(){
        if($rootScope.previousState) {
            $state.go($rootScope.previousState);
        } else {
            $state.go('dashboard.participants.search.validation');
        }
    };
}]);