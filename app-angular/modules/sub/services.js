'use strict';

angular.module('genie.sub.services',[])

.factory('SubSearchConfig', ['APP_CONFIG', 'AuthenticationService', 'AuthInterceptor', '$translate', function (APP_CONFIG, AuthenticationService, AuthInterceptor, $translate) {
    return {

        text: {
            singular: $translate.instant('SUB.SUB_SINGLE'),
            plural: $translate.instant('SUB.SUB_PLURAL')
        },

        searchParams: {
            itemsPerPage: 25,
            currentPage: 1
        },

        filterModel: {
            "searchString": "",
            "participantFulfillmentFilter": {
                "fulfillmentTypeList": [
                    ""
                ]
            }
        },

        resourceConfig: {
            defaultUrl: APP_CONFIG.apiBaseUrl +
            '/admin/'+ APP_CONFIG.realmName +'/participantFulfillment/:action' +
            '?token=' + AuthenticationService.getGlobals().currentUser.token +
            '&itemsPerPage=' + (this.searchParams ? this.searchParams.itemsPerPage : 25) +
            '&currentPage=' + (this.searchParams ? this.searchParams.currentPage : 1),
            search: {
                params: {action: "search"},
                method:'POST',
                interceptor: AuthInterceptor
            }
        }
    }
}])
.factory('RMAStepService', ['APP_CONFIG', '$rootScope',function(APP_CONFIG, $rootScope){
    return {
        validateFormComplete: false,
        currentStep: 0,
        steps: {
            0: {
                id: "search"
            },
            1: {
                id: "info"
            },
            2: {
                id: "validate"
            },
            3: {
                id: "confirm"
            }
        }
    }
}])
.factory('RMA', ['Resource', 'APP_CONFIG', '$rootScope','AuthInterceptor', function($resource, configs, $rootScope, AuthInterceptor){

    var token = $rootScope.globals.currentUser.token;

    return $resource(configs.apiBaseUrl + '/admin/fulfillment/'+ configs.realmName +'/participants/:username/machines/:machineIdentifier/rma?token=' + token,{
        machineIdentifier:"@machineIdentifier",
        username:"@username"
    },
    {
        query: {method:'GET', params:{itemsPerPage:12}, interceptor: AuthInterceptor,
        create:{
            method:'POST',
            interceptor: AuthInterceptor
        }
    }
    });
}])
.factory('RMAValidationForm', [function(){
    var service = {
        errorMessages : {
            VERIFICATION : "L'installation doit être vérifiée par l'agent avec le participant",
            RECONNECT : "Le participant doit avoir essayé de déconnecter puis reconnecter son dispositif",
            OVERNIGHT_DECONNECT : "Le participant doit avoir bien essayé de déconnecter le dispositif le temps d'une nuit",
            BLINK_20_SECS : "Le voyant lumineux du dispositif doit arrêter de clignoter toutes les 20 secondes",
            NO_VEHICLE_CHANGE: "Le partcipant ne doit pas changer le dispositif de véhicule"
        }
    };

    return service;
}])
.factory('RMAService', ['AuthInterceptor','ParticipantProfileService', 'RMA', '$q', function(AuthInterceptor, ParticipantProfileService, RMA, $q){
    var service = {
        username : null,
        MID : null,
        machine : null,
        participant : null,
        address : null,
        packaging : null,
        packagingTypes : [
            {id : "NORMAL_RETURN_ENVELOPE" , name : "Avec enveloppe de retour"},
            {id : "EXPRESS_RETURN_ENVELOPE" , name :  "Avec enveloppe de retour EXPRESS"},
            {id : "NO_RETURN_ENVELOPE" , name :  "Sans enveloppe de retour"}
        ],
        reset : function(){
            service.username = null;
            service.MID = null;
            service.machine = null;
            service.participant = null;
            service.address = null;
            service.packaging = null;
        },
        resource : RMA,
        send : function(){
            var params = {
                machineIdentifier: service.machine.machineIdentifier,
                username: service.participant.user.username
            };
            //console.log(RMA);
            return service.resource.create(params).$promise;
        },
        saveAddress : function(){
            var params = angular.extend(service.address,{username:service.participant.user.username});

            //console.log(params);
            //alert("gothere");

            if(params.name)
            {
                return ParticipantProfileService.getResource().saveAddress(params).$promise.then(function(data){
                    service.address = data
                    return true;
                },function(){
                    return false;
                });
            }else{
                return false;
            }
        },
        saveParticipant : function(){

            return ParticipantProfileService.getResource().saveParticipant(service.participant).$promise.then(function(data){
                //service.participant = data
                return true;
            },function(){
                return false;
            });
        },
        fetchParticipant : function(username){
            return ParticipantProfileService.getResource().getByUsername({username:username}).$promise.then(function(data){

                return data;

                //service.participant = data;
                //return service.participant;
            });
        },
        getParticipant : function(){

            if(!service.participant)
            {
                var username = service.username;

                if(!username)
                {
                    return false;
                }

                return ParticipantProfileService.getResource().getByUsername({username:username}).$promise;
            }else{

                return $q(function(resolve,reject){
                    resolve(service.participant);
                });
            }
        },
        getMachine : function(){

            if(!service.machine)
            {
                var username = service.username, MID = service.MID;

                if(!username)
                {
                    return false;
                }

                if(!MID)
                {
                    return false;
                }

                return ParticipantProfileService.getResource().getMachinesByUsername({username:username}).$promise.then(function(data){
                    var x;
                    for (x in data) {
                        var machine = data[x];
                        if(machine.machineIdentifier == MID)
                        {
                            service.machine = machine;
                            return service.machine;
                        }
                    }
                });
            }else{
                return $q(function(resolve,reject){
                    resolve(service.machine);
                });
                //return service.machine;
            }
        },
        getAddress : function(){
            if(!service.address)
            {
                return service.getParticipant().then(function(data){
                    if(data.user.addresses.length > 0)
                    {
                        service.address = data.user.addresses[0];
                        return service.address;
                    }
                });
            }else{
                return $q(function(resolve,reject){
                    resolve(service.address);
                });
            }
        }
    };

    return service;
}])
;