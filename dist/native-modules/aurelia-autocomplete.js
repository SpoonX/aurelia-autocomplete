'use strict';

exports.__esModule = true;
exports.logger = exports.AutoCompleteCustomElement = undefined;

var _autocomplete = require('./component/autocomplete');

Object.defineProperty(exports, 'AutoCompleteCustomElement', {
  enumerable: true,
  get: function get() {
    return _autocomplete.AutoCompleteCustomElement;
  }
});
exports.configure = configure;

var _aureliaViewManager = require('aurelia-view-manager');

var _aureliaLogging = require('aurelia-logging');

function configure(aurelia, configCallback) {
  aurelia.container.get(_aureliaViewManager.Config).configureNamespace('spoonx/autocomplete', {
    location: './{{framework}}/{{view}}.html'
  });

  if (typeof configCallback === 'function') {
    configCallback();
  }

  aurelia.globalResources('./component/autocomplete');
}

var logger = (0, _aureliaLogging.getLogger)('aurelia-autocomplete');

exports.logger = logger;