'use strict';
  
angular.module('genie.participants',[
	'genie.resource',
	'ui.bootstrap',
	'daterangepicker',
	'frapontillo.bootstrap-switch',

	'genie.participants.controllers',
	'genie.participants.directives',
	'genie.participants.services'
])
.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider){

	$urlRouterProvider.when('/participants', '/home');
	$urlRouterProvider.when('/participants/batch', '/home');

	//parent state
	$stateProvider
	.state('dashboard.participants', {
		url: '/participants',
		ncyBreadcrumb: {
			label: "{{ 'PARTICIPANTS.BREADCRUMB.PARTICIPANTS' | translate }}"
		},
		abstract: true
	})

	//action states
	.state('dashboard.participants.batch', {
		url: '/batch',
		abstract: true,
		ncyBreadcrumb: {
			label: "{{ 'PARTICIPANTS.BREADCRUMB.BATCH' | translate }}"
		},
		views: {
			'container@dashboard': {
				templateUrl: 'app-angular/modules/batch/templates/batch-body.html',
				controller: 'batchController'
			},
			'breadcrumbs@dashboard.participants.batch': {
				templateUrl: 'app-angular/templates/layouts/dashboard-breadcrumbs.html'
			}
		}
	})
	.state('dashboard.participants.batch.action', {
		url: '/:action',
		ncyBreadcrumb: {
			label: '{{$state.params.action[0].toUpperCase() + $state.params.action.substring(1)}}'
		},
		parent: 'dashboard.participants.batch'
	})



	.state('dashboard.participants.profile', {
		url: '/profil/:username',
		ncyBreadcrumb: {
			label: "{{ 'PARTICIPANTS.BREADCRUMB.PROFILE_OF' | translate }} {{participant.user.username}}",
			parent: 'dashboard.participants'
		},
		parent: 'dashboard.participants',
		views: {
			'container@dashboard': {
				templateUrl: 'app-angular/modules/participants/templates/profile.html',
				controller: 'participantsProfileController'
			},
			'breadcrumbs@dashboard.participants.profile': {
				templateUrl: 'app-angular/templates/layouts/dashboard-breadcrumbs.html'
			}
		}
	})



	//viewing states
	.state('dashboard.participants.search', {
		url: '',
		abstract: true,
		views: {
			'container@dashboard': {
				templateUrl: 'app-angular/modules/search/templates/search-container.html',
				controller: 'searchController'
			},
			'searchbar@dashboard.participants.search': {
				templateUrl: 'app-angular/modules/search/templates/search-searchbar.html',
				controller: 'searchHeaderController'
			},
			'footer@dashboard.participants.search': {
				templateUrl: 'app-angular/modules/search/templates/search-footer.html',
				controller: 'searchFooterController'
			},
			'breadcrumbs@dashboard.participants.search': {
				templateUrl: 'app-angular/templates/layouts/dashboard-breadcrumbs.html'
			}
		}
	})
	.state('dashboard.participants.search.validation', {
		url: '/validation',
		ncyBreadcrumb: {
			label: "{{ 'PARTICIPANTS.BREADCRUMB.VALI' | translate }}",
			parent: 'dashboard.participants'
		},
		parent: 'dashboard.participants.search',
		views: {
			'table@dashboard.participants.search': {
				templateUrl: 'app-angular/modules/participants/templates/validation-table.html',
				controller: 'participantsValiController'
			}
		}
	})
	.state('dashboard.participants.search.suivi', {
		url: '/suivi',
		ncyBreadcrumb: {
			label: "{{ 'PARTICIPANTS.BREADCRUMB.SUIVI' | translate }}",
			parent: 'dashboard.participants'
		},
		parent: 'dashboard.participants.search',
		views: {
			'table@dashboard.participants.search': {
				templateUrl: 'app-angular/modules/participants/templates/suivi-table.html',
				controller: 'participantsSuiviController'
			}
		}
	})
	.state('dashboard.participants.search.desa', {
		url: '/desabonner',
		ncyBreadcrumb: {
			label: "{{ 'PARTICIPANTS.BREADCRUMB.DESA' | translate }}",
			parent: 'dashboard.participants'
		},
		parent: 'dashboard.participants.search',
		views: {
			'table@dashboard.participants.search': {
				templateUrl: 'app-angular/modules/participants/templates/desa-table.html',
				controller: 'participantsDesaController'
			}
		}
	})
	.state('dashboard.participants.search.refuse', {
		url: '/refuse',
		ncyBreadcrumb: {
			label: "{{ 'PARTICIPANTS.BREADCRUMB.REFU' | translate }}",
			parent: 'dashboard.participants'
		},
		parent: 'dashboard.participants.search',
		views: {
			'table@dashboard.participants.search': {
				templateUrl: 'app-angular/modules/participants/templates/refused-table.html',
				controller: 'participantsRefuseController'
			}
		}
	});
}]);
