"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* Import all modules that can be concated, eg. ValueConverters, CustomElements etc, for bundling.
 * Those also need to be added to spoonx.js 'importsToAdd' and 'jsResources' and
 * the package.json's' "aurelia.build.resources" (there without extension if view/view-model and with
 * .html extension for views without view-model).
*/
// import {AuthFilterValueConverter} from './authFilterValueConverter'; 
// eslint-disable-line no-unused-vars
var aurelia_view_manager_1 = require("aurelia-view-manager");
var aurelia_logging_1 = require("aurelia-logging");
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
var autocomplete_1 = require("./component/autocomplete");
exports.AutoCompleteCustomElement = autocomplete_1.AutoCompleteCustomElement;
exports.logger = aurelia_logging_1.getLogger('aurelia-autocomplete');
