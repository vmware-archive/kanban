(function(exports) {
    "use strict";

    var Dispatcher = function(model) {
        this.model = model;
        this.listeners = [];
    };

    Dispatcher.prototype = {
        addListener: function(l) {
            this.listeners.push(l);
        },
        handle: function(c) {
            var self = this;
            this.model.handle(c).forEach(function(e) {
                self.listeners.forEach(function(l) {
                    l(e);
                });
            });
        },
        apply: function(e) {
            this.model.apply(e);
            this.listeners.forEach(function(l) {
                l(e);
            });
        },
    };

    exports.Dispatcher = Dispatcher;
})(this);
