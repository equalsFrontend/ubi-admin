var app = angular.module('imetrik-app', [
	'ui.router',
	'angular-loading-bar',
	'ngAnimate',
	'ngSanitize',
	'ngResource',
	"ngMaterial",
	'angular-growl',
	'ncy-angular-breadcrumb',
	'pascalprecht.translate',
	'LocalStorageModule',
	'base64',

	'imetrik-app.services',
	'imetrik-app.directives',
	'imetrik-app.controllers',

	'genie.auth',
	'genie.dashboard',
	'genie.search',
	'genie.participants',
	'genie.batch',
	'genie.rma',
	'genie.sub',
	'genie.translate'

]);

app.constant("APP_CONFIG", {
	"apiBaseUrl" : (function(){

		//alpha
		if(location.host.indexOf('alpha') > -1) {
			return "";

		//beta
		} else if(location.host.indexOf('beta') > -1){
			return "";

		//local or integration
		} else if(location.host.indexOf('integration') > -1 || location.host.indexOf('localhost') > -1 || location.host.indexOf('10.10') > -1){
			return "http://integration.saas.insurance.imetrik.com/api/v2";

		//prod
		} else if (location.host.indexOf('maif.insurance.imetrik.com') > -1 || location.host.indexOf('maif.microsite.imetrik.com') > -1 || location.host.indexOf('maifandgo.fr') > -1) {
			return "";

		//demo
		} else {
			return "";
		}
	})(),
	"realmName" : "maif_ubi"
});

app.config(['localStorageServiceProvider', '$stateProvider', '$urlRouterProvider', '$breadcrumbProvider', 'cfpLoadingBarProvider', 'growlProvider', '$mdThemingProvider', '$locationProvider', '$httpProvider','$translateProvider', function(localStorageServiceProvider, $stateProvider, $urlRouterProvider, $breadcrumbProvider, cfpLoadingBarProvider, growlProvider, $mdThemingProvider, $locationProvider, $httpProvider, $translateProvider) {

	localStorageServiceProvider
	.setPrefix('UBIAdmin')
	.setStorageType('localStorage')
	.setStorageCookie(0.3);

	// Loader bar
	cfpLoadingBarProvider.includeSpinner = false;
	cfpLoadingBarProvider.latencyThreshold = 0;
	
	// Growl
	growlProvider.globalTimeToLive(3000);
	growlProvider.globalPosition('bottom-right');
	growlProvider.onlyUniqueMessages(false);
	growlProvider.globalDisableCloseButton(true);
	growlProvider.globalDisableIcons(true);

	$urlRouterProvider.when('', '/login');
	$urlRouterProvider.when('/', '/login');
	$urlRouterProvider.otherwise('/login');

	$breadcrumbProvider.setOptions({
		includeAbstract: true
	});

	$mdThemingProvider.definePalette('client', {
		'50': "#e8e8e8",
		'100': "#e8e8e8",
		'200': "#e8e8e8",
		'300': "#e8e8e8",
		'400': "#63D041",
		'500': "#63D041",
		'600': "#63D041",
		'700': "#63D041",
		'800': "#63D041",
		'900': "#65656a",
		'A100': "#65656a",
		'A200': "#65656a",
		'A400': "#65656a",
		'A700': "#65656a",
		'contrastDefaultColor': 'light',
		'contrastDarkColors': '100 200 300 400 A100',
		'contrastStrongLightColors': '500 600 700 A200 A400 A700'
	});
	$mdThemingProvider.theme('default').primaryPalette("client");

	//main states
	$stateProvider
	.state('login', {
		url: '/login',
		views: {
			'main': {
				templateUrl: 'app-angular/templates/layouts/login.html',
				controller: 'loginController'
			}
		}
	})
	.state('profile', {
		url: '/profile'
	})
	.state('dashboard', {
		url: '',
		abstract: true,
		ncyBreadcrumb: {
			label: "{{'DASHBOARD.BREADCRUMB.DASHBOARD'|translate}}"
		},
		views: {
			'main': {
				templateUrl: 'app-angular/templates/layouts/dashboard.html',
				controller: 'MainController'
			},
			'nav@dashboard': {
				templateUrl: 'app-angular/templates/layouts/dashboard-nav.html',
				controller: 'NavController'
			}
		}
	});
}]);

app.run([ '$rootScope', 'SidebarService', 'localStorageService', function($rootScope,SidebarService, localStorageService) {

	var sidebarOpen = 'true';

	sidebarOpen = localStorageService.get('sidebarOpen');

	if(sidebarOpen == null) {
		sidebarOpen = false;
		localStorageService.set('sidebarOpen', false)
	}

	SidebarService.isOpen = sidebarOpen;

	$rootScope.navLocked = sidebarOpen;

	$("body").on("change",".check-all", function(){
		var target = $(this).data("target");
		$(target).prop('checked', this.checked);
	})
	.on('click', '.dropdown-menu:not(.bootstrap-select .dropdown-menu)', function(e) {
		e.stopPropagation();
	})
	.on("click",".w-btn-toggle", function() {
		var x;
		$(this).toggleClass('active');
		if (x = $(this).attr("w-toggle"))
			$(x).toggleClass('show')
	})
	.on("click", ".w-toggle", function(e) {

		var ele = $(this).closest("li");
		if ($(".w-nav li.open").index() != ele.index()) {
			$(".w-nav li.open").removeClass("open");
		}

		$(this).parent().toggleClass("open");
		e.preventDefault();
	});
}])
.filter('to_trusted', ['$sce', function($sce){
	return function(text) {
		return $sce.trustAsHtml(text);
	};
}]);