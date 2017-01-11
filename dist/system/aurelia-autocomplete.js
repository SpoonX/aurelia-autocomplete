'use strict';

System.register(['aurelia-view-manager', 'aurelia-logging', './component/autocomplete'], function (_export, _context) {
  "use strict";

  var ViewManager, getLogger, AutoCompleteCustomElement, logger;
  function configure(aurelia, configCallback) {
    aurelia.container.get(ViewManager).configureNamespace('spoonx/autocomplete', {
      location: './{{framework}}/{{view}}.html'
    });

    if (typeof configCallback === 'function') {
      configCallback();
    }

    aurelia.globalResources('./component/autocomplete');
  }

  _export('configure', configure);

  return {
    setters: [function (_aureliaViewManager) {
      ViewManager = _aureliaViewManager.Config;
    }, function (_aureliaLogging) {
      getLogger = _aureliaLogging.getLogger;
    }, function (_componentAutocomplete) {
      AutoCompleteCustomElement = _componentAutocomplete.AutoCompleteCustomElement;
      var _exportObj = {};
      _exportObj.AutoCompleteCustomElement = _componentAutocomplete.AutoCompleteCustomElement;

      _export(_exportObj);
    }],
    execute: function () {
      _export('logger', logger = getLogger('aurelia-autocomplete'));

      _export('logger', logger);
    }
  };
});