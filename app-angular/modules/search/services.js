'use strict';

angular.module('genie.search.services',[])

.factory('AbstractSearchService', ['$q', 'Resource', '$timeout', '$sce', function($q, Resource, $timeout, $sce){

    return {

        configure: function(config){

            this.config = angular.copy(config);

            this.setText(angular.copy(this.config.text));

            this.setResourceConfig(angular.copy(this.config.resourceConfig));
            this.setResourceUrl(); //depends on config

            this.setFilterModel(angular.copy(this.config.filterModel));
            this.setSearchParams(angular.copy(this.config.searchParams), true);

            if(this.config.resultsElement) this.setResultsElement(angular.copy(this.config.resultsElement));
            if(this.config.commands) this.setCommands(angular.copy(this.config.commands));

        },



        //text is currently only used in the pagination
        //it is used to describe the results
        text: {
            single: "Result",
            plural: "Results"
        },
        getText: function(){
            return this.text;
        },
        setText: function(text){
            this.text = text;
        },



        //used to configure the resources for api calls
        getResourceConfig: function() {
            return this.resourceConfig;
        },
        setResourceConfig: function(resource){
            this.resourceConfig = resource;
        },
        getResource: function(){
            return Resource(this.getResourceUrl(), { action: '' }, this.getResourceConfig());
        },



        //resource url needs logic to customize the api call, based solely off search params
        resourceUrl: "",
        getResourceUrl: function(){
            return this.resourceUrl;
        },
        setResourceUrl: function(params){
            var apiAndToken = this.getResourceConfig().defaultUrl.split('&itemsPerPage=')[0];

            if(!params || !params.itemsPerPage){
                params = this.getSearchParams();
            }

            this.resourceUrl = apiAndToken + "&itemsPerPage=" + params.itemsPerPage + "&currentPage=" + params.currentPage;
        },



        //fitlers used in the api queries, ie. searchString and participantFilters etc
        //this filter model should map to the api request model
        filterModel: {},
        setFilterModel: function(model){
            if(!model){
                this.filterModel = {
                    "searchString": ""
                }
            } else {
                this.filterModel = model;
            }
        },
        getFilterModel: function(){
            return this.filterModel;
        },



        //used defining params in the api calls based on user input
        searchParams: {},
        defaultSearchParams: {},
        getSearchParams: function(){
            return this.searchParams;
        },
        setSearchParams: function(searchParams, _default){
            if(!searchParams){
                this.searchParams = {
                    itemsPerPage: 25,
                    currentPage: 1
                };
            } else {
                angular.extend(this.searchParams, searchParams);
                this.setResourceUrl(searchParams);
            }

            if(_default) this.defaultSearchParams = angular.copy(searchParams);

            angular.extend(this.searchParams, {
                filters: this.getFilterModel()
            });
        },
        resetSearchParams: function(){
            this.searchParams = angular.copy(this.defaultSearchParams);

            angular.extend(this.searchParams, {
                filters: this.getFilterModel()
            });
        },



        //filters used to send to "fulfillmentTypeList" or "participantStatusList"
        getFilters: function(){
            return this.searchParams.filters;
        },
        getFilter: function(filterKey){
            return this.searchParams.filters.filterKey;
        },
        setFilters: function(filters){
            this.searchParams.filters = filters;
        },
        setFilter: function(filter){
            var key = Object.keys(filter)[0],
                val = filter[key];

            var targetFilterKey = Object.keys(this.getFilters())[1];

            this.getFilters()[targetFilterKey][key] = val;
        },



        //commands are just custom events
        commands: {},
        getCommands: function(){
            return this.commands;
        },
        getCommand: function(command){
            return this.commands[command];
        },
        setCommands: function(commands){
            this.commands = commands;
        },



        //search string that is sent to the api
        getSearchString: function(){
            return this.getFilters().searchString;
        },
        setSearchString: function(string){
            this.getFilters().searchString = string;
        },



        //results and calling the resource
        results: [],
        getResults: function(){
            return this.results;
        },
        setResults: function(results){
            this.results = results;
        },
        fetch: function(blank){
            var self = this,
                q       = $q.defer();

            var filters = angular.copy(this.getFilters());

            this.setResourceUrl();

            if(blank) filters.searchString = "";

            this.getResource().search(filters).$promise.then( function(data){

                self.details = {
                    totalItems: data.totalNumberOfItem,
                    totalPages: data.totalNumberOfPage,
                    currentPage: data.currentPageNumber
                };

                //highlight the necessary text
                if(filters.searchString != "") {
                    data.paginatedItems = self.highlightJSON(data.paginatedItems, filters.searchString);
                }

                self.results = data.paginatedItems;
                self.pages = self.returnPages(data);

                q.resolve(data.paginatedItems);
            }, function(){

                self.details = {
                    totalItems: 0,
                    totalPages: 0,
                    currentPage: 0
                };

                self.results = [];
                self.pages = [];

                q.reject(false);
            });

            return q.promise;
        },
        highlightJSON: function(obj, searchParam){
            var stringData = JSON.stringify(obj),
                regex = '/:".*?((' + searchParam + ').*?)"/gim'; // enter this pattern into tester to test ->  :".*?((test).*?)"

            stringData = stringData.replace(eval(regex), function(str, p1, p2, p3){

                return (str.replace(p2, '<span class=\'highlighted\'>' + p2 + '</span>'));
            });

            return JSON.parse($sce.trustAsHtml(stringData));
        },
        unhighlightJSON: function(string){
            var s = string;

            if(s){
                s = s.replace("<span class='highlighted'>", "");
                s = s.replace("</span>", "");
            }

            return s;
        },



        //results element is the element that the child controller
        //decides will host the results, this is where we inject
        //expects a jQuery object
        //the controller will go grab the angular scope off of that element
        //neat little acrobatic trick ;)
        resultsElement: {},
        getResultsElement: function(){
            return this.resultsElement;
        },
        setResultsElement: function(element){
            this.resultsElement = element;
        },



        //pagination
        pages: [],
        getCurrentPage: function(page){
            return this.searchParams.currentPage;
        },
        setCurrentPage: function(page){
            this.searchParams.currentPage = page;
            this.config.searchParams.currentPage = page;
        },
        returnPages: function(data){

            var pagesInRange = [],
                pageCount    = data.totalNumberOfPage,
                currentPage  = data.currentPageNumber,
                previous     = (currentPage > 0) ? currentPage - 1 : null,
                next         = (currentPage < pageCount) ? currentPage + 1 : null,
                first        = (currentPage == 1) ? null : 1,
                last         = (currentPage == pageCount) ? null : pageCount;

            var max = 4;

            if(pageCount < 4){
                max = pageCount;
            }

            //build 4 pages from current
            for (var p = currentPage; p < currentPage + max ; p++) {

                if(p > 0){
                    pagesInRange.push(p);
                }
            }

            //if on last 4 pages
            if(currentPage > pageCount - max){

                pagesInRange = [];

                //just reset the pages and put 4 up until the end
                for (var i = pageCount - (max - 1); i <= pageCount; i++){


                    pagesInRange.push(i);
                }
            }

            return {
                last : last,
                first : first,
                previous : previous,
                next : next,
                current : currentPage,
                pagesInRange : pagesInRange,
                pageCount : pageCount
            };
        },
        changePage: function(page){
            var self = this;
            $timeout(function(){
                self.setCurrentPage(page);
            }, 1);
        }
    }
}]);