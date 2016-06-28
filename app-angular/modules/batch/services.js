'use strict';

angular.module('genie.batch.services',[])

.factory('BatchService', ['$q', function($q) {
    return {
        batchList: [],
        batchActions: {},
        currentAction: null,
        setBatchList: function(list){
            this.batchList = list;
        },
        getBatchList: function(){
            return this.batchList;
        },
        setBatchActions: function(actions){
            this.batchActions = actions;
        },
        getBatchActions: function(){
            return this.batchActions;
        },
        toggle: function(item){
            var idx = this.batchList.indexOf(item);
            if (idx > -1) this.batchList.splice(idx, 1);
            else this.batchList.push(item);
        },
        exists: function(item){
            return this.batchList.indexOf(item) > -1;
        },
        addItem: function(item){
            if(this.batchList.indexOf(item) < 0){
                this.batchList.push(item);
            }
        },
        removeItem: function(item){
            var i = this.batchList.indexOf(item);
            if(i > -1) {
                this.batchList.splice(i, 1);
            }
        },
        removeAll: function(){
            this.batchList = [];
        }
    }
}]);