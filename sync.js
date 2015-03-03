(function(exports) {
    "use strict";

    var Synchronizer = function(trackerToken, project, person_id, dispatcher) {
        this.d = dispatcher;
        this.token = trackerToken;
        this.project = project;
        this.person_id = person_id;
        this.pollerTimeout = null;
    };

    Synchronizer.prototype = {
        run: function() {
            this.d.addListener(this.apply.bind(this));
            this._pollForUpdates();
        },
        apply: function(e) {
            if(e.client_intent != "attempt" || e.type != "story_update") {
                return;
            }

            var data = {
                command: {
                    type: e.type,
                    parameters: e.parameters,
                    command_uuid: guid(),
                },
                person_id: this.person_id,
                project: {
                    id: this.project.id,
                    version: Math.floor(this.project.version),
                },
            };

            clearTimeout(this.pollerTimeout);
            var self = this;
            $.ajax({
                type: "POST",
                url: "https://www.pivotaltracker.com/services/v5/commands",
                headers: {
                    "X-TrackerToken": self.token,
                },
                contentType: "application/json",
                processData: false,
                data: JSON.stringify(data),
                dataType: "json",
                success: function(data) {
                    if(data.result == "executed") {
                        data.executed_commands.forEach(function(e) {
                            e.client_intent = "success";
                            self.d.apply(e);
                        });
                    } else {
                        console.log("Stale, retrying");
                        self.d.apply(getRollbackForEvent(self.project, e));
                        data.stale_commands.forEach(function(e) {
                            e.client_intent = "success";
                            self.d.apply(e);
                        });
                        e.project.version = self.project.version + CLIENT_VERSION_DELTA;
                        self.d.apply(e);
                    }
                },
                error: function() {
                    alert("Rolling back");
                    self.d.apply(getRollbackForEvent(self.project, e));
                },
                complete: function() {
                    self._pollForUpdates();
                },
            });
        },
        _pollForUpdates: function() {
            var self = this;
            $.ajax({
                url:"https://www.pivotaltracker.com/services/v5/project_stale_commands/"+self.project.id+"/"+self.project.version+"?token="+self.token,
                success: function(body) {
                    body.data.stale_commands.forEach(function(e) {
                        e.client_intent = "success";
                        self.d.apply(e);
                    });
                    self.pollerTimeout = setTimeout(self._pollForUpdates.bind(self), 3000);
                },
            });
        },
    };

    function getRollbackForEvent(project, e) {
        var rollback = $.extend(true, {}, e);
        rollback.client_intent = "failure";
        var mutanda = rollback.mutandum;
        rollback.mutandum = rollback.results;
        rollback.results = mutanda;
        var keys = Object.keys(rollback.parameters).filter(function(k) { return k != "id"; });
        var result = findStoryInModels(rollback.results, rollback.parameters.id);
        keys.forEach(function(k) {
            rollback.parameters[k] = result[k];
        });
        rollback.project.version = project.version + CLIENT_VERSION_DELTA;
        return rollback;
    }

    exports.Synchronizer = Synchronizer;
})(this);
