'use strict';
  
angular.module('genie.modal',['angularModalService'])
.factory('GenieModalService',['$rootScope', 'ModalService', function($rootScope, ModalService) {
	
	function GenieModalService(options)
	{
		var self = this;
		
		self.showModal = function(options) {
			// Just provide a template url, a controller and call 'showModal'.
		    ModalService.showModal({
		      templateUrl: "/app-angular/modules/modal/templates/modal.html",
		      controller: "modalController",
		      inputs: {options:options}
		    }).then(function(modal) {
		      // The modal object has the element built, if this is a bootstrap modal
		      // you can call 'modal' to show it, if it's a custom modal just show or hide
		      // it as you need to.
		      $(modal.element).modal();
		    });
		};
	}
	
	return new GenieModalService();
}])
.controller('modalController',['$scope', 'close', 'options', function($scope, close, options){
	$scope.options = options;
	$scope.close = function() {
	    close(); // close, but give 200ms for bootstrap to animate
	};
}]);
;