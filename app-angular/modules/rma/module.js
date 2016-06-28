'use strict';
  
angular.module('genie.rma',[

	'genie.rma.services',
	'genie.rma.controllers'
])

.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider){

	$urlRouterProvider.when('/rma', '/home');

	//parent state
	$stateProvider
	.state('dashboard.rma', {
		url: '/rma',
		ncyBreadcrumb: {
			label: "{{'RMA.BREADCRUMB.HOME' | translate}}"
		},
		abstract: true
	})

	.state('dashboard.rma.search', {
		url: '',
		abstract: true,
		views: {
			'container@dashboard': {
				templateUrl: 'app-angular/modules/search/templates/search-container.html',
				controller: 'searchController'
			},
			'breadcrumbs@dashboard.rma.search': {
				templateUrl: 'app-angular/templates/layouts/dashboard-breadcrumbs.html'
			},
			'searchbar@dashboard.rma.search': {
				templateUrl: 'app-angular/modules/search/templates/search-searchbar.html',
				controller: 'searchHeaderController'
			},
			'footer@dashboard.rma.search': {
				templateUrl: 'app-angular/modules/search/templates/search-footer.html',
				controller: 'searchFooterController'
			}
		}
	})
	.state('dashboard.rma.search.suivi', {
		url: '/suivi',
		ncyBreadcrumb: {
			label: "{{ 'RMA.MENU.SUIVI' | translate }}",
			parent: 'dashboard.rma'
		},
		parent: 'dashboard.rma.search',
		views: {
			'table@dashboard.rma.search': {
				templateUrl: 'app-angular/modules/rma/templates/suivi-table.html',
				controller: 'rmaSearchController'
			}
		}
	})




	//action states
	.state('dashboard.rma.declare', {
		url: '/declare',
		abstract: true,
		ncyBreadcrumb: {
			label: "{{'RMA.BREADCRUMB.DECLARE' | translate}}"
		},
		views: {
			'container@dashboard': {
				templateUrl: 'app-angular/modules/fulfillments/templates/declare.html',
				controller: 'rmaDeclareController'
			},
			'progress@dashboard.rma.declare': {
				templateUrl: 'app-angular/modules/rma/templates/declare-navright.html'
			}
		}
	})
	.state('dashboard.rma.declare.search', {
		url: '',
		ncyBreadcrumb: {
			skip: true
		},
		parent: 'dashboard.rma.declare',
		views: {
			'step@dashboard.rma.declare': {
				templateUrl: 'app-angular/modules/fulfillments/templates/declare-search.html'
			},
			'declare-search-container@dashboard.rma.declare.search': {
				templateUrl: 'app-angular/modules/search/templates/search-container.html',
				controller: 'searchController'
			},
			'searchbar-top@dashboard.rma.declare.search': {
				templateUrl: 'app-angular/modules/search/templates/search-searchbar.html',
				controller: 'searchHeaderController'
			},
			'table@dashboard.rma.declare.search': {
				templateUrl: 'app-angular/modules/rma/templates/declare-table.html',
				controller: 'rmaDeclareSearchController'
			},
			'footer@dashboard.rma.declare.search': {
				templateUrl: 'app-angular/modules/search/templates/search-footer.html',
				controller: 'searchFooterController'
			},
			'breadcrumbs@dashboard.rma.declare.search': {
				templateUrl: 'app-angular/templates/layouts/dashboard-breadcrumbs.html'
			}
		},
		params : {
			currentStep : 'search'
		}
	})
	.state('dashboard.rma.declare.info', {
		url: '/:user/:MID',
		ncyBreadcrumb: {
			skip: true
		},
		parent: 'dashboard.rma.declare',
		views: {
			'step@dashboard.rma.declare': {
				templateUrl: 'app-angular/modules/fulfillments/templates/declare-info.html',
				controller: 'rmaInfoController'
			},
			'breadcrumbs@dashboard.rma.declare': {
				templateUrl: 'app-angular/templates/layouts/dashboard-breadcrumbs.html'
			}
		}
	})
	.state('dashboard.rma.declare.validate', {
		url: '/:user/:MID/validate',
		ncyBreadcrumb: {
			skip: true
		},
		parent: 'dashboard.rma.declare',
		views: {
			'step@dashboard.rma.declare': {
				templateUrl: 'app-angular/modules/rma/templates/declare-validation.html',
				controller: 'rmaValidateController'
			},
			'breadcrumbs@dashboard.rma.declare': {
				templateUrl: 'app-angular/templates/layouts/dashboard-breadcrumbs.html'
			}
		}
	})
	.state('dashboard.rma.declare.confirm', {
		url: '/:user/:MID/confirm',
		ncyBreadcrumb: {
			skip: true
		},
		parent: 'dashboard.rma.declare',
		views: {
			'step@dashboard.rma.declare': {
				templateUrl: 'app-angular/modules/rma/templates/declare-confirmation.html',
				controller: 'rmaConfirmController'
			},
			'breadcrumbs@dashboard.rma.declare': {
				templateUrl: 'app-angular/templates/layouts/dashboard-breadcrumbs.html'
			}
		}
	});
}]);