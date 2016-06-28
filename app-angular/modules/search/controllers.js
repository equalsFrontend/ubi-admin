'use strict';

angular.module('genie.search.controllers',[])

.controller('searchController',['AbstractSearchService', 'BatchService', '$rootScope', '$translate', '$injector', '$timeout', '$state', '$scope', function(AbstractSearchService, BatchService, $rootScope, $translate, $injector, $timeout, $state, $scope) {
    $scope.service = AbstractSearchService;

    $scope.to               = null;
    $scope.lastCallWasBlank = true;
    $scope.pageChange       = false;
    $scope.searchChange     = false;

    $scope.$state = $state;

    $scope.$on('refreshSearch', function(argobj){
        $scope.refreshSearch(argobj);
    });

    $scope.cancelSearch = function(){
        $scope.service.searchParams.filters.searchString = "";

        initiateSearchTimeout(true, 1);
    };

    $scope.refreshSearch = function(argobj){
        $scope.service.fetch().then(function(data){

            setChildScopeParticipants(data);

        });
    };

    $scope.cleanHighlightedData = function(string){
        return $scope.service.unhighlightJSON(string);
    };

    $scope.updateSearch = function(newValue, oldValue){

        //if neither are filled, it's just a page change
        if(!newValue && !oldValue){
            $scope.pageChange = true;

            if($scope.service.searchParams.filters.searchString.length <= 2){
                initiateSearchTimeout(true, 1);
            } else {
                initiateSearchTimeout(false, 1);
            }

        } else {

            $scope.service.setSearchParams(newValue);

            if(newValue != oldValue){

                if(newValue.filters.searchString != oldValue.filters.searchString) $scope.searchChange = true;

                //if we have less than 3 characters, fetch parts with a "blank" flag (the true in the fetch args)
                if(newValue.filters.searchString.length <= 2){

                    initiateSearchTimeout(true);
                } else {

                    initiateSearchTimeout(false);
                }

            }
        }
    };

    $scope.onEnter = function(){

        if($scope.service.searchParams.filters.searchString.length < 3){

            initiateSearchTimeout(true, 1);
        } else {

            initiateSearchTimeout(false, 1);
        }
    };

    $scope.checkHandler = function (item) {
        BatchService.toggle($scope.cleanHighlightedData(item));
    };

    $scope.exists = function (item) {
        return BatchService.exists($scope.cleanHighlightedData(item));
    };

    $scope.checkAll = function(clickEvent) {
        if(true == clickEvent.target.checked)
        {
            for(var x in $scope.service.results)
            {
                var participant = $scope.service.results[x];
                BatchService.addItem($scope.cleanHighlightedData(participant.user.username));
            }
        } else {
            BatchService.removeAll();
        }
    };

    //private

    function initiateSearchTimeout(blank, duration){

        //if this is an empty search, and the last search was empty, and it's not a page change, stop here
        if(blank && $scope.lastCallWasBlank && !$scope.pageChange) return false;


        //if this is a blank search and the last one wasn't and it wasn't a page change, go back to page 1
        if(blank && !$scope.lastCallWasBlank && !$scope.pageChange) $scope.service.resetSearchParams();


        //if this is not a blank search and not a page change, go back to page 1
        if(!blank && !$scope.pageChange) $scope.service.resetSearchParams();


        //if there is currently a timeout in progress, cancel it to process this new one
        if($scope.to) $timeout.cancel($scope.to);


        //start timer
        $scope.to = $timeout(function(){

            //if this wasn't a page change, add the loading spinner to the search box
            if(!$scope.pageChange) $('.w-search-form label').addClass('in-progress');
            $scope.service.getResultsElement().addClass('in-progress');

            //go get data
            $scope.service.fetch((blank ? true : false)).then(function(data){
                fetchCompleteHandler(data)
            }, function(data){
                fetchCompleteHandler(data);
            });

            $scope.pageChange       = false;
            $scope.lastCallWasBlank = blank;
            $scope.to               = null;

        }, (duration ? duration : 1000));
    }

    function fetchCompleteHandler(data){

        $scope.to = null;

        $('.tc-hidden.show').removeClass('show');
        $('.hidden-field-toggle').removeClass('active');
        $('.w-search-form label').removeClass('in-progress');
        $scope.service.getResultsElement().removeClass('in-progress');

        setChildScopeParticipants(data);
    }

    //sends results to child table scope
    function setChildScopeParticipants(data){
        var childScope = angular.element($scope.service.getResultsElement()).scope();

        childScope.searchResults = data;
        childScope.pages = $scope.service.pages;
    }

}])

.controller('searchHeaderController',['$state', '$scope', '$location', 'AbstractSearchService', '$timeout', function($state, $scope,  $location, AbstractSearchService, $timeout) {

    $scope.service = AbstractSearchService;

    $scope.hiddenFields = [];

    angular.element(document).ready(function () {
        $timeout(function(){
            $scope.hiddenFields = generateHiddenFields();
        });
    });

    function generateHiddenFields(){
        var hiddenHeaders = $('th.tc-hidden'),
            headersArr = [];

        for(var i = 0; i < hiddenHeaders.length; i++){
            var field = hiddenHeaders[i];

            headersArr.push({
                title: field.innerHTML,
                cssClass: field.classList[1]
            });
        }

        return headersArr;
    }

}])

.controller('searchFooterController',['$translate', '$state', '$scope', '$location', '$mdDialog', 'AbstractSearchService', 'BatchService', function($translate, $state, $scope, $location, $mdDialog, AbstractSearchService, BatchService) {

    $scope.batchClickHandler = function(action){
        BatchService.currentAction = action;
        $state.go('dashboard.participants.batch.action', {
            action: action.title.toLowerCase()
        });
    };
    $scope.batchService = BatchService;
    $scope.batchList = BatchService.batchList;

    $scope.service = AbstractSearchService;

    $scope.handlePageClick = function(page, oldValue) {

        if (BatchService.batchList.length > 0) {

            var checkboxConfirm = $mdDialog.confirm()
                .title($translate.instant('DIALOG.CONFIRM.PAGE_CHANGE.TITLE'))
                .textContent($translate.instant('DIALOG.CONFIRM.PAGE_CHANGE.LIST'))
                .ok($translate.instant('DIALOG.CONFIRM.YES'))
                .cancel($translate.instant('DIALOG.CONFIRM.NO'));

            $mdDialog.show(checkboxConfirm).then(function () {

                $scope.batchList = BatchService.batchList = [];

                $('#datatable input').attr('ng-checked', false);
                $scope.service.changePage(page);

                $scope.updateSearch();
            }, function () {
                //clicked no
            });

        } else {
            $scope.service.changePage(page);

            $scope.updateSearch();
        }
    };
}]);