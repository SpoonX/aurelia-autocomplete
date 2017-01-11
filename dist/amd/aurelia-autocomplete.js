define(['exports', './component/autocomplete', 'aurelia-view-manager', 'aurelia-logging'], function (exports, _autocomplete, _aureliaViewManager, _aureliaLogging) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.logger = exports.AutoCompleteCustomElement = undefined;
  Object.defineProperty(exports, 'AutoCompleteCustomElement', {
    enumerable: true,
    get: function () {
      return _autocomplete.AutoCompleteCustomElement;
    }
  });
  exports.configure = configure;
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
});