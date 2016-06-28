'use strict';

angular.module('genie.participants.services',['genie.auth.services'])


.factory('ParticipantProfileService', ['APP_CONFIG', 'AuthenticationService', 'AuthInterceptor', 'Resource', function(APP_CONFIG, AuthenticationService, AuthInterceptor, Resource){
    return {

        getResource: function(){
            return Resource(null, { action: '' }, this.resourceConfig);
        },

        resourceConfig: {
            getByUsername: {
                url: APP_CONFIG.apiBaseUrl + '/admin/:realmName/participants/:username'
                + '?token=' + AuthenticationService.getGlobals().currentUser.token,
                params: {realmName : APP_CONFIG.realmName},
                method:'GET',
                interceptor: AuthInterceptor
            },
            getMachinesByUsername: {
                url: APP_CONFIG.apiBaseUrl + '/admin/:realmName/participants/:username/machines'
                + '?token=' + AuthenticationService.getGlobals().currentUser.token,
                params: {realmName : APP_CONFIG.realmName},
                isArray : true,
                method:'GET',
                interceptor: AuthInterceptor
            },
            saveAddress: {
                url: APP_CONFIG.apiBaseUrl + '/admin/:realmName/participants/:username/addresses/:addressName'
                + '?token=' + AuthenticationService.getGlobals().currentUser.token,
                params: {realmName : APP_CONFIG.realmName, username : "@username", addressName : "@name"},
                method:'PUT',
                interceptor: AuthInterceptor
            },
            saveParticipant:{
                url: APP_CONFIG.apiBaseUrl + '/admin/:realmName/participants/:username'
                + '?token=' + AuthenticationService.getGlobals().currentUser.token,
                params: {realmName : APP_CONFIG.realmName, username : "@user.username"},
                method:'PUT',
                interceptor: AuthInterceptor
            },
            addAddress: {
                url: APP_CONFIG.apiBaseUrl + '/admin/:realmName/participants/:username/addresses'
                + '?token=' + AuthenticationService.getGlobals().currentUser.token,
                params: {realmName : APP_CONFIG.realmName, username : "@username"},
                method:'POST',
                interceptor: AuthInterceptor
            }
        }
    }
}])

.factory('ParticipantsSearchConfig', ['APP_CONFIG', '$rootScope', 'growl', 'Resource', 'AuthenticationService', 'AbstractSearchService', 'AuthInterceptor', '$mdDialog', '$translate', '$timeout', '$injector', function (APP_CONFIG, $rootScope, growl, Resource, AuthenticationService, AbstractSearchService, AuthInterceptor, $mdDialog, $translate, $timeout, $injector) {
    return {

        text: {
            singular: $translate.instant('PARTICIPANTS.PARTICIPANT_SINGLE'),
            plural: $translate.instant('PARTICIPANTS.PARTICIPANT_PLURAL')
        },

        actions:{
            validate : {
                id: 'validate',
                title: 'Valider',
                status : 'VALIDATED'
            },
            unsubscribe : {
                id: 'unsubscribe',
                title: 'Désabonner',
                status : 'UNSUBSCRIBED'
            },refuse : {
                id: 'refuse',
                title: 'Refuser',
                status : 'REFUSED'
            },
            delete : {
                id: 'delete',
                title: 'Supprimer',
                status : 'DELETED'
            }
        },

        searchParams: {
            itemsPerPage: 25,
            currentPage: 1
        },

        filterModel: {
            "searchString": "",
            "participantFilter": {
                "participantStatusList": [
                    ""
                ]
            }
        },


        resourceConfig: {
            defaultUrl: APP_CONFIG.apiBaseUrl +
                '/admin/'+ APP_CONFIG.realmName +'/participants/:action' +
                '?token=' + AuthenticationService.getGlobals().currentUser.token +
                '&itemsPerPage=' + (this.searchParams ? this.searchParams.itemsPerPage : 25) +
                '&currentPage=' + (this.searchParams ? this.searchParams.currentPage : 1),
            search: {
                params: {action: "search"},
                method:'POST',
                interceptor: AuthInterceptor
            },
            getByUsername: {
                url: APP_CONFIG.apiBaseUrl + '/admin/:realmName/participants/:username'
                + '?token=' + AuthenticationService.getGlobals().currentUser.token,
                params: {realmName : APP_CONFIG.realmName},
                method:'GET',
                interceptor: AuthInterceptor
            },
            getMachinesByUsername: {
                url: APP_CONFIG.apiBaseUrl + '/admin/:realmName/participants/:username/machines'
                + '?token=' + AuthenticationService.getGlobals().currentUser.token,
                params: {realmName : APP_CONFIG.realmName},
                isArray : true,
                method:'GET',
                interceptor: AuthInterceptor
            },
            saveAddress: {
                url: APP_CONFIG.apiBaseUrl + '/admin/:realmName/participants/:username/addresses/:addressName'
                + '?token=' + AuthenticationService.getGlobals().currentUser.token,
                params: {realmName : APP_CONFIG.realmName, username : "@username", addressName : "@name"},
                method:'PUT',
                interceptor: AuthInterceptor
            },
            saveParticipant:{
                url: APP_CONFIG.apiBaseUrl + '/admin/:realmName/participants/:username'
                + '?token=' + AuthenticationService.getGlobals().currentUser.token,
                params: {realmName : APP_CONFIG.realmName, username : "@user.username"},
                method:'PUT',
                interceptor: AuthInterceptor
            },
            addAddress: {
                url: APP_CONFIG.apiBaseUrl + '/admin/:realmName/participants/:username/addresses'
                + '?token=' + AuthenticationService.getGlobals().currentUser.token,
                params: {realmName : APP_CONFIG.realmName, username : "@username"},
                method:'POST',
                interceptor: AuthInterceptor
            }
        },
        commands: {
            performAction: function(username, action){
                var url = APP_CONFIG.apiBaseUrl +  '/admin/'+ APP_CONFIG.realmName + '/participants/:username/:action'
                    + '?token=' + AuthenticationService.getGlobals().currentUser.token;

                var resource = Resource(url, { action: action, username: username });

                return resource.save().$promise;
            },
            confirmStatusChange: function(username, action){

                var self = this;

                var actionConfirm = $mdDialog.confirm({
                    onShowing: function(scope, element, options, controller) {

                        //overwriting default onShowing function to get proper styling injected
                        if (controller) {
                            controller.mdHtmlContent = controller.htmlContent || options.htmlContent || '';
                            controller.mdTextContent = controller.textContent || options.textContent ||
                                controller.content || options.content || '';

                            //proper styling injection
                            $timeout(function(){
                                $('md-dialog').addClass(action.id);
                            }, 50);

                            if (controller.mdHtmlContent && !$injector.has('$sanitize')) {
                                throw Error('The ngSanitize module must be loaded in order to use htmlContent.');
                            }

                            if (controller.mdHtmlContent && controller.mdTextContent) {
                                throw Error('md-dialog cannot have both `htmlContent` and `textContent`');
                            }
                        }
                    }
                })
                .title($translate.instant('PARTICIPANTS.ACTIONS.' + action.id.toUpperCase()))
                .htmlContent($translate.instant('DIALOG.CONFIRM.ACTION.ARE_YOU_SURE') + " <span>" + $translate.instant('PARTICIPANTS.ACTIONS.' + action.id.toUpperCase()).toLowerCase() + "</span> " + $translate.instant('DIALOG.CONFIRM.ACTION.THE_PARTICIPANT') + " " + username + "?")
                .ok($translate.instant('DIALOG.CONFIRM.ACTION.YES'))
                .cancel($translate.instant('DIALOG.CONFIRM.ACTION.NO'));

                //show action confirm dialog
                $mdDialog.show(actionConfirm).then(function(){

                    //call api to perform action
                    self.performAction(username, action.id).then(function(){

                        growl.success($translate.instant('DIALOG.ALERT.ACTION.SUCCESS'));
                        $('#row-' + username).addClass('success');

                        $rootScope.$broadcast('refreshSearch', {'username': username });

                    }, function(error){

                        var failTryAgain = $mdDialog.alert()
                            .clickOutsideToClose(true)
                            .title($translate.instant('PARTICIPANTS.ACTIONS.' + action.id.toUpperCase()))
                            .htmlContent(action.title + " " + $translate.instant('DIALOG.CONFIRM.ACTION.THE_PARTICIPANT') + " " + username + "? <br/><br/>" + ErrorService.translate(error.data.message))
                            .ok($translate.instant('DIALOG.ALERT.OK'));

                        //action failed
                        $mdDialog.show(failTryAgain);

                    });
                });
            }
        }
    }
}]);