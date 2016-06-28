var module = angular.module( 'genie.resource', [ 'ngResource' ] );

module.factory( 'Resource', [ '$resource', function( $resource ) {
    return function( url, params, methods ) {

        if(!url) var url = methods.url;

        var defaults = {
            update: { method: 'put', isArray: false },
            create: { method: 'post' }
        };

        methods = angular.extend( defaults, methods );

        var resource = $resource( url, params, methods );

        return resource;
   };
}]);