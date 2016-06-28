'use strict';

angular.module('genie.dashboard',[
	'genie.dashboard.controllers'
])
.config(['$stateProvider', function($stateProvider){

	$stateProvider
	.state('dashboard.home', {
		url: '/dashboard',
		ncyBreadcrumb: {
			label: "{{ 'DASHBOARD.BREADCRUMB.HOME' | translate }}"
		},
		views: {
			'container': {
				templateUrl: 'app-angular/modules/dashboard/templates/dashboard.html',
				controller: 'dashboardController'
			},
			'breadcrumbs@dashboard.home': {
				templateUrl: 'app-angular/templates/layouts/dashboard-breadcrumbs.html'
			}
		}
	});

}]);