define(["require", "exports", "aurelia-view-manager", "aurelia-logging", "./component/autocomplete"], function (require, exports, aurelia_view_manager_1, aurelia_logging_1, autocomplete_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function configure(aurelia, configCallback) {
        aurelia.container.get(aurelia_view_manager_1.Config).configureNamespace('spoonx/autocomplete', {
            location: './{{framework}}/{{view}}.html'
        });
        if (typeof configCallback === 'function') {
            configCallback();
        }
        aurelia.globalResources('./component/autocomplete');
    }
    exports.configure = configure;
    exports.AutoCompleteCustomElement = autocomplete_1.AutoCompleteCustomElement;
    exports.logger = aurelia_logging_1.getLogger('aurelia-autocomplete');
});
