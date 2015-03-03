(function(exports) {
    "use strict";

    var CLIENT_VERSION_DELTA = 0.0001;
    exports.CLIENT_VERSION_DELTA = CLIENT_VERSION_DELTA;

    var Project = function(initialState) {
        this.version = initialState.version;
        this.id = initialState.id;
        this.storiesById = {};
        var self = this;
        initialState.stories.forEach(function(story) {
            self.storiesById[story.id] = story;
        });
    };

    Project.prototype = {
        handle: function(c) {
            switch(c.type) {
            case "story_update":
                return this.handleStoryUpdate(c);
            }
            return [];
        },
        apply: function(e) {
            if(e.project.version > this.version + 1 && e.project.version <= this.version) {
                console.log("Event out of order " + e.type + "(" + e.command_uuid + "): expected " + (this.version + 1) + " but got " + e.project.version);
                return;
            }
            this.version = e.project.version;

            var self = this;
            e.results.forEach(function(r) {
                switch(r.type) {
                case "story":
                   self._updateStory(r); 
                }
            });
        },
        handleStoryUpdate: function(c) {
            var story = this.storiesById[c.parameters.id];
            if(!story) {
                console.error("Could not find story " + c.parameters.id);
                return [];
            }

            var self = this;
            var mutandum = {
                type: "story",
            };
            var result = {
                type: "story",
            };
            var keys = Object.keys(c.parameters);
            keys.forEach(function(key) {
                mutandum[key] = story[key];
                result[key] = c.parameters[key];
            });
            this._updateStory(c.parameters);

            return [{
                type: "story_update",
                client_intent: "attempt",
                parameters: c.parameters,
                project: {
                    id: this.id,
                    version: this.version + CLIENT_VERSION_DELTA,
                },
                mutandum:[mutandum],
                results:[result],
            }];
        },
        _updateStory: function(updates) {
           var keys = Object.keys(updates).filter(function(key) { return key != "id" && key != "type"; }); 
           var story = this.storiesById[updates.id];
           if(!story) {
               story = this.storiesById[updates.id] = {
                   id: updates.id,
                   type: "story",
               };
           }
           for(var i=0; i<keys.length; i++) {
               var key = keys[i];
               story[key] = updates[key];
           }
        },
    };

    exports.Project = Project;
})(this);
