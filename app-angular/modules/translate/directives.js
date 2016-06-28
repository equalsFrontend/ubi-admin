'use strict';

angular.module('genie.translate.directives',[])
    .directive('langSwitcher', function() {
        return {
            controller: ['$scope', '$translate', 'localStorageService', function($scope, $translate, localStorageService){
                $scope.languages = [
                    {
                        id : "fr",
                        title : "FR"
                    },{
                        id : "en",
                        title : "EN"
                    }
                ];

                $scope.currentLang = $translate.use();

                $scope.switchLang = function(lang){
                    $scope.currentLang = lang.id;
                    $translate.use($scope.currentLang);


                    localStorageService.set('currentLang', lang.id);
                }
            }],
            templateUrl: 'app-angular/modules/translate/templates/lang-switcher.html'
        };
    })
;