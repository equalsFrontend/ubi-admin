'use strict';
  
angular.module('genie.translate',['pascalprecht.translate', 'genie.translate.directives'])

.config(['$translateProvider','$translatePartialLoaderProvider', function($translateProvider, $translatePartialLoaderProvider){
	$translateProvider.useLoader('$translatePartialLoader', {
		urlTemplate: 'app-angular/modules/{part}/{lang}.json'
	});

	$translatePartialLoaderProvider.addPart('dashboard');

}])
.run(['$translate', 'localStorageService', function($translate, localStorageService){

		var defaultLang = 'fr';

		if(localStorageService.get('currentLang')){
			defaultLang = localStorageService.get('currentLang');
		} else {
			localStorageService.set('currentLang', defaultLang)
		}
		$translate.use(defaultLang);
}]);
