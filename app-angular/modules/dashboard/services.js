'use strict';

angular.module('genie.dashboard.services',['genie.auth.services'])

.factory('SidebarService', [function()
{
    return {
        isOpen : true
    };
}])
;