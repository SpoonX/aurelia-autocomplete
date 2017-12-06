System.register(["aurelia-view-manager", "aurelia-logging", "./component/autocomplete"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function configure(aurelia, configCallback) {
        aurelia.container.get(aurelia_view_manager_1.Config).configureNamespace('spoonx/autocomplete', {
            location: './{{framework}}/{{view}}.html'
        });
        if (typeof configCallback === 'function') {
            configCallback();
        }
        aurelia.globalResources('./component/autocomplete');
    }
    exports_1("configure", configure);
    var aurelia_view_manager_1, aurelia_logging_1, logger;
    return {
        setters: [
            function (aurelia_view_manager_1_1) {
                aurelia_view_manager_1 = aurelia_view_manager_1_1;
            },
            function (aurelia_logging_1_1) {
                aurelia_logging_1 = aurelia_logging_1_1;
            },
            function (autocomplete_1_1) {
                exports_1({
                    "AutoCompleteCustomElement": autocomplete_1_1["AutoCompleteCustomElement"]
                });
            }
        ],
        execute: function () {
            exports_1("logger", logger = aurelia_logging_1.getLogger('aurelia-autocomplete'));
        }
    };
});
