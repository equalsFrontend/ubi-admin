'use strict';
  
angular.module('genie.sub',[
	'genie.sub.services',
	'genie.sub.controllers'
])

.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider){

	$urlRouterProvider.when('/sub', '/home');

	//parent state
	$stateProvider
	.state('dashboard.sub', {
		url: '/sub',
		ncyBreadcrumb: {
			label: 'Substitution'
		},
		abstract: true
	})

	.state('dashboard.sub.search', {
		url: '',
		abstract: true,
		views: {
			'container@dashboard': {
				templateUrl: 'app-angular/modules/search/templates/search-container.html',
				controller: 'searchController'
			},
			'searchbar@dashboard.sub.search': {
				templateUrl: 'app-angular/modules/search/templates/search-searchbar.html',
				controller: 'searchHeaderController'
			},
			'footer@dashboard.sub.search': {
				templateUrl: 'app-angular/modules/search/templates/search-footer.html',
				controller: 'searchFooterController'
			},
			'breadcrumbs@dashboard.sub.search': {
				templateUrl: 'app-angular/templates/layouts/dashboard-breadcrumbs.html'
			}
		}
	})
	.state('dashboard.sub.search.suivi', {
		url: '/suivi',
		ncyBreadcrumb: {
			label: "{{ 'SUB.MENU.SUIVI' | translate }}",
			parent: 'dashboard.sub'
		},
		parent: 'dashboard.sub.search',
		views: {
			'table@dashboard.sub.search': {
				templateUrl: 'app-angular/modules/sub/templates/suivi-table.html',
				controller: 'subSearchController'
			}
		}
	})

	//action states
	.state('dashboard.sub.declare', {
		url: '/declare',
		abstract: true,
		ncyBreadcrumb: {
			label: "Déclarer"
		},
		views: {
			'container@dashboard': {
				templateUrl: 'app-angular/modules/fulfillments/templates/declare.html',
				controller: 'subDeclareController'
			},
			'breadcrumbs@dashboard.sub.declare': {
				templateUrl: 'app-angular/templates/layouts/dashboard-breadcrumbs.html'
			},
			'progress@dashboard.sub.declare': {
				templateUrl: 'app-angular/modules/sub/templates/declare-navright.html',
				//controller: 'subProgressController'
			}
		}
	})
	.state('dashboard.sub.declare.search', {
		url: '',
		ncyBreadcrumb: {
			skip: true
		},
		parent: 'dashboard.sub.declare',
		views: {
			'step@dashboard.sub.declare': {
				templateUrl: 'app-angular/modules/fulfillments/templates/declare-search.html'
			},
			'declare-search-container@dashboard.sub.declare.search': {
				templateUrl: 'app-angular/modules/search/templates/search-container.html',
				controller: 'searchController'
			},
			'searchbar-top@dashboard.sub.declare.search': {
				templateUrl: 'app-angular/modules/search/templates/search-searchbar.html',
				controller: 'searchHeaderController'
			},
			'table@dashboard.sub.declare.search': {
				templateUrl: 'app-angular/modules/sub/templates/declare-table.html',
				controller: 'subDeclareSearchController'
			},
			'footer@dashboard.sub.declare.search': {
				templateUrl: 'app-angular/modules/search/templates/search-footer.html',
				controller: 'searchFooterController'
			},
			'breadcrumbs@dashboard.sub.declare.search': {
				templateUrl: 'app-angular/templates/layouts/dashboard-breadcrumbs.html'
			}
		},
		params : {
			currentStep : 'search'
		}
	})
	.state('dashboard.sub.declare.info', {
		url: '/:user/:MID',
		ncyBreadcrumb: {
			skip: true
		},
		parent: 'dashboard.sub.declare',
		views: {
			'step@dashboard.sub.declare': {
				templateUrl: 'app-angular/modules/fulfillments/templates/declare-info.html',
				controller: 'subInfoController'
			}
		},
		params : {
			currentStep : 'info'
		}
	})
	.state('dashboard.sub.declare.vehicle', {
		url: '/:user/:MID/vehicle',
		ncyBreadcrumb: {
			skip: true
		},
		parent: 'dashboard.sub.declare',
		views: {
			'step@dashboard.sub.declare': {
				templateUrl: 'app-angular/modules/sub/templates/declare-vehicle.html',
				controller: 'subVehicleController'
			}
		},
		params : {
			currentStep : 'vehicle'
		}
	})
	.state('dashboard.sub.declare.confirm', {
		url: '/:user/:MID/confirm',
		ncyBreadcrumb: {
			skip: true
		},
		parent: 'dashboard.sub.declare',
		views: {
			'step@dashboard.sub.declare': {
				templateUrl: 'app-angular/modules/sub/templates/declare-confirmation.html',
				controller: 'subConfirmController'
			}
		}
	});
}]);