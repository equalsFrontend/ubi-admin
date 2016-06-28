'use strict';

angular.module('genie.dashboard.controllers',['genie.dashboard.services'])
.config(['$translateProvider','$translatePartialLoaderProvider',function ($translateProvider, $translatePartialLoaderProvider) {
    $translatePartialLoaderProvider.addPart('dashboard');
}])
.controller('dashboardController',['$scope', 'SidebarService', function($scope, SidebarService){



}]);