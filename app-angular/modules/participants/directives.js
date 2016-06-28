'use strict';

angular.module('genie.participants.directives',[])

.directive('statusBadge', function(){
    return {
        // responsible for registering DOM listeners as well as updating the DOM
        template:function(elem, attr){

            //var status = scope.participant.status;
            var status = attr.status;
            var statuses = {
                'VALIDATED': 'text-success',
                'UNSUBSCRIBED': "text-muted",
                'SUBSCRIBED': "text-warning",
                'REFUSED': "text-danger"
            };

            var statusClass = statuses[status];

            if(!statusClass){
                statusClass = "text-muted";
            }
            return "<span class='"+ statusClass +"'><em class='fa fa-circle'></em></span>";
        }
    };
});