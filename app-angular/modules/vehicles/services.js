'use strict';

angular.module('genie.vehicles.services',['genie.auth.services'])

.factory('Brands', ['Resource', 'APP_CONFIG', '$rootScope','AuthInterceptor', function($resource, configs, $rootScope, AuthInterceptor){

    var token;

    if($rootScope.globals)
    {
        token = $rootScope.globals.currentUser.token;
    }


    return {
        resource : function(){
            return $resource(configs.apiBaseUrl + '/admin/maif_ubi/vehicleBrands?token=' + token,{},
            {
                query: {
                    method:'GET',
                    isArray:true,
                    //params:{itemsPerPage:12},
                    interceptor: AuthInterceptor
                }
            });
        }
    };
}])
;