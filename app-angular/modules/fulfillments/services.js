'use strict';

angular.module('genie.fulfillments.services',['genie.auth.services', 'genie.participants.services'])
.factory('FulfillmentsService',['ParticipantProfileService', '$q',function(ParticipantProfileService, $q){
    return {
        username : null,
        participant : null,
        address : null,
        MID : null,
        getParticipant : function(){

            var service = this;

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

            var service = this;

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
            var service = this;

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
        },
        getStepPreceding : function(currentStepId){
            var previousStep = null;
            var steps = this.steps;

            var i;
            for (i=0; i < steps.length; i++)
            {
                var step = steps[i];

                if(step.id == currentStepId)
                {
                    return previousStep;
                }
                previousStep = step;
            }

            return previousStep;
        },
        saveParticipant : function(){
            var service = this;

            return ParticipantProfileService.getResource().saveParticipant(service.participant).$promise.then(function(data){
                //service.participant = data
                return true;
            },function(){
                return false;
            });
        },
        saveAddress : function(){
            var service = this;

            var params = angular.extend(service.address,{username:service.participant.user.username});

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
        }
    };
}])
.factory('RMAsService',['FulfillmentsService','Resource', 'APP_CONFIG', 'AuthInterceptor','$rootScope', function(FulfillmentsService, $resource, configs, AuthInterceptor, $rootScope){
    return angular.extend(FulfillmentsService, {
        steps: [
            {
                id: "search",
                title : "RMA.DECLARE.SEARCH"

            },
            {
                id: "info",
                title : "RMA.DECLARE.INFO"
            },
            {
                id: "vehicle",
                title : "RMA.DECLARE.VEHICLE"
            },
            {
                id: "confirm",
                title : "RMA.DECLARE.CONFIRM"
            }
        ],
        newVehicle : null,
        reset : function(){
            this.participant = null;
            this.machine = null;
            this.address = null;
            this.newVehicle = null;
        },
        resource : function(){

            var token = $rootScope.globals.currentUser.token;

            return $resource(configs.apiBaseUrl + '/admin/fulfillment/'+ configs.realmName +'/participants/:username/machines/:machineIdentifier/substitute?token=' + token,{
                    machineIdentifier:"@machineIdentifier",
                    username:"@username",
                    note:"@note"
                },
                {
                    create:{
                        method:'POST',
                        interceptor: AuthInterceptor
                    }
                });
        },
        send : function(){
            var service = this;

            var params = angular.extend(service.newVehicle, {
                machineIdentifier: service.machine.machineIdentifier,
                username: service.participant.user.username,
                note: service.newVehicle.note
            });

            return service.resource().create(params).$promise;
        }
    });
}])
.factory('SubsService',['FulfillmentsService','Resource', 'APP_CONFIG', 'AuthInterceptor','$rootScope', function(FulfillmentsService, $resource, configs, AuthInterceptor, $rootScope){
    return angular.extend(FulfillmentsService, {
        steps: [
            {
                id: "search",
                title : "Choix du participant"

            },
            {
                id: "info",
                title : "Vérification des informations"
            },
            {
                id: "vehicle",
                title : "Nouveau Véhicule"
            },
            {
                id: "confirm",
                title : "Confirmation"
            }
        ],
        newVehicle : null,
        reset : function(){
            this.participant = null;
            this.machine = null;
            this.address = null;
            this.newVehicle = null;
        },
        resource : function(){

            var token = $rootScope.globals.currentUser.token;

            return $resource(configs.apiBaseUrl + '/admin/fulfillment/'+ configs.realmName +'/participants/:username/machines/:machineIdentifier/substitute?token=' + token,{
                machineIdentifier:"@machineIdentifier",
                username:"@username",
                note:"@note"
            },
            {
                create:{
                    method:'POST',
                    interceptor: AuthInterceptor
                }
            });
        },
        send : function(){
            var service = this;

            var params = angular.extend(service.newVehicle, {
                machineIdentifier: service.machine.machineIdentifier,
                username: service.participant.user.username,
                note: service.newVehicle.note
            });

            return service.resource().create(params).$promise;
        }
    });
}]);