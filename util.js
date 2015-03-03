(function(exports) {
    "use strict";

    exports.findStoryInModels = function(models, id) {
        for(var i=0; i < models.length; i++) {
            if(models[i].type == "story" && models[i].id == id) {
                return models[i];
            }
        }
        return null;
    };

    exports.indexOfModelInCollection = function(models, id) {
        for(var i=0; i < models.length; i++) {
            if(models[i].id == id) {
                return i;
            }
        }
        return -1;
    };

    exports.collectionForState = function(state) {
        switch(state) {
        case 'unscheduled':
            return 'unscheduled';
        case 'unstarted':
            return 'pending';
        case 'started':
            return 'doing';
        case 'finished':
            return 'done';
        case 'delivered':
            return 'test';
        case 'accepted':
            return 'deploy';
        case 'rejected':
            return 'doing';
        }
        return 'state_' + state + '_does_not_exist';
    };

    exports.transitionsForState = function(state) {
        switch(state) {
        case 'unscheduled':
            return ['do'];
        case 'unstarted':
            return ['do'];
        case 'started':
            return ['finish'];
        case 'finished':
            return ['deliver'];
        case 'delivered':
            return ['reject', 'accept'];
        case 'accepted':
            return [];
        case 'rejected':
            return ['restart'];
        }
        return 'state_' + state + '_does_not_exist';
    };

    exports.nextStateFromTransition = function(transition) {
        switch(transition) {
        case 'do':
        case 'restart':
            return 'started';
        case 'finish':
            return 'finished';
        case 'deliver':
            return 'delivered';
        case 'accept':
            return 'accepted';
        case 'reject':
            return 'rejected';
        }
        return 'transition_' + transition + '_does_not_exist';
    };

    exports.uiStateForClientIntent = function(client_intent) {
        switch(client_intent) {
        case "attempt":
            return "unsynchronized";
        case "success":
        case "failure":
            return "synchronized";

        }
    };

    /**
     *  Generates a GUID string.
     *  @returns {String} The generated GUID.
     *  @example af8a8416-6e18-a307-bd9c-f2c947bbb3aa
     *  @author Slavik Meltser (slavik@meltser.info).
     *  @link http://slavik.meltser.info/?p=142
     */
    exports.guid = function() {
        function _p8(s) {
            var p = (Math.random().toString(16)+"000000000").substr(2,8);
            return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;
        }
        return _p8() + _p8(true) + _p8(true) + _p8();
    }
})(this);
