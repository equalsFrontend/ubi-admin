'use strict';

angular.module('imetrik-app.services',[])

.factory('ErrorService', ['localStorageService', function(localStorageService){
    return {
        translate: function(message){
            var newMessage = "Message d'erreur.";

            switch(true){
                case (message.indexOf("No appropriate machine of type 'vehicle'") > -1):
                    newMessage = "Le type 'véhicule' n'est pas approprié pour l'utilisateur.";
                    break;
                case (message.indexOf("The participant is not in a REFUSED or SUBSCRIBED state") > -1):
                    newMessage = "Le participant n'est pas dans l'état REFUSÉ ou VALIDÉ.";
                    break;
                case (message.indexOf("The machine of the participant is not associated to a device yet") > -1):
                    newMessage = "Le véhicule du participant n'a pas été encore associé à un boitier.";
                    break;
                case (message.indexOf("A CANCEL has already been created today" > -1)):
                    newMessage = "Une annulation a déjà été demandée aujourd'hui pour cet utilisateur et cet identifiant machine.";
                    break;
                case ((message.indexOf("The user") > -1) && (message.indexOf("does not exist") > -1)):
                    newMessage = "Le participant n'existe pas.";
                    break;
                case (message.indexOf("No shipping address found for the specified") > -1):
                    newMessage = "L'adresse d'expédition pour ce participant n'a pas été trouvée.";
                    break;
                case (message.indexOf("The OUT message was not received within") > -1):
                    newMessage = "Timeout message d'erreur.";
                    break;
                case (message.indexOf("The machine of the participant is no longer associated to its configured device") > -1):
                    newMessage = "Le véhicule du participant n'est plus associé au boitier";
                    break;
                case (message.indexOf("The machine to substitute has no active associated device") > -1):
                    newMessage = "";
                    break;
            }

            if(localStorageService.get("currentLang") == 'fr'){
                return newMessage;
            } else {
                return message;
            }
        }
    }
}])

.factory('Pays', ['Resource',function($resource){
    return $resource('/api/countries',null, {
        query: {
            method: 'GET'
        }
    });
}])

.factory('States', ['Resource',function($resource){
    return $resource('/api/states',null, {
        query: {
            method: 'GET'
        }
    });
}])

.factory('Brands', ['Resource',function($resource){
    return $resource('/api/brands',null, {
        query: {
            method: 'GET'
        }
    });
}])

.factory('Models', ['Resource',function($resource){
    return $resource('/api/models',null, {
        query: {
            method: 'GET'
        }
    });
}]);