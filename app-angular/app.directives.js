'use strict';

angular.module('imetrik-app.directives',['genie.dashboard.services'])

.directive('sidebar', ['$state', function($state) {
    return {
        controller: ['$scope', '$rootScope', '$element','SidebarService', 'localStorageService', '$timeout', function($scope, $rootScope, $element,SidebarService, localStorageService, $timeout){

            $scope.isOpen = SidebarService.isOpen;

            $scope.sidebarClass = function(){
                return ($scope.isOpen === 'true') ? "sidebar-open" : "sidebar-closed" ;
            };

            $scope.expandSidebar = function(){
                if(localStorageService.get('sidebarOpen') === 'false' || localStorageService.get('sidebarOpen') === false || localStorageService.get('sidebarOpen') == null) $scope.isOpen = 'true';
            };

            $scope.closeSidebar = function(){
                if(localStorageService.get('sidebarOpen') === 'false' || localStorageService.get('sidebarOpen') === false || localStorageService.get('sidebarOpen') == null) $scope.isOpen = 'false';
            };

            $scope.toggleSidebar = function(){
                var isOpen = ($scope.isOpen === 'true') ? 'false' : 'true' ;
                $scope.isOpen = isOpen ;
                $timeout(function(){
                    $rootScope.navLocked = isOpen;
                }, 1);
                localStorageService.set('sidebarOpen', isOpen);
            };
        }]
    }
}])

.directive('onEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.onEnter);
                });

                event.preventDefault();
            }
        });
    };
})

.directive('inOutAnim', ['$state', function($state) {
    return {
        controller: ['$scope', '$rootScope', '$element', function($scope, $rootScope, $element){
            if($rootScope.backward){
                $element.removeClass('forward');
                $element.addClass('backward');
            } else {
                $element.removeClass('backward');
                $element.addClass('forward');
            }
        }]
    }
}])

.directive('dropdownToggle', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            $(element).dropdown(scope.$eval(attrs.dropdownToggle));
        }
    };
})

.directive('mobiDatetime', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            //var attribs = angular.fromJson(attrs.mobiDatetime);

            //console.log(element);

            $(element).mobiscroll().datetime();
        }
    };
})

.directive('dateRange', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            //var attribs = angular.fromJson(attrs.mobiDatetime);
            //console.log(attrs.daterangeCallback);

            $(element).daterangepicker(
                {
                    locale: {
                        format: 'YYYY-MM-DD'
                    }
                });
        }
    };
})

.directive('nestedSelect', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {

            var attribs = angular.fromJson(attrs.nestedSelect);

            $(element).on("change", function(){
                var val = $(this).val();

                //var attribs = JSON.parse(attrs.nestedSelect);

                var childSelector = attribs.childSelector  + " option";

                var parentAttribute = attribs.parentAttribute;

                $(childSelector).hide();
                $(childSelector + "["+ parentAttribute +"='all']").show();

                if(val != "" && $(childSelector + "[" + parentAttribute + "='"+ val +"']").length > 0)
                {
                    $(childSelector + "[" + parentAttribute + "="+ val +"]").show();
                }
            });
        }
    };
});