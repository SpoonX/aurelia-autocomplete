define(["exports", "aurelia-framework", "aurelia-api", "../aurelia-autocomplete", "aurelia-pal", "aurelia-view-manager"], function (exports, _aureliaFramework, _aureliaApi, _aureliaAutocomplete, _aureliaPal, _aureliaViewManager) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.AutoCompleteCustomElement = undefined;

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  function _initDefineProp(target, property, descriptor, context) {
    if (!descriptor) return;
    Object.defineProperty(target, property, {
      enumerable: descriptor.enumerable,
      configurable: descriptor.configurable,
      writable: descriptor.writable,
      value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
    });
  }

  

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
    var desc = {};
    Object['ke' + 'ys'](descriptor).forEach(function (key) {
      desc[key] = descriptor[key];
    });
    desc.enumerable = !!desc.enumerable;
    desc.configurable = !!desc.configurable;

    if ('value' in desc || desc.initializer) {
      desc.writable = true;
    }

    desc = decorators.slice().reverse().reduce(function (desc, decorator) {
      return decorator(target, property, desc) || desc;
    }, desc);

    if (context && desc.initializer !== void 0) {
      desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
      desc.initializer = undefined;
    }

    if (desc.initializer === void 0) {
      Object['define' + 'Property'](target, property, desc);
      desc = null;
    }

    return desc;
  }

  function _initializerWarningHelper(descriptor, context) {
    throw new Error('Decorating class property failed. Please ensure that transform-class-properties is enabled.');
  }

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _class, _desc, _value, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _descriptor17, _descriptor18, _descriptor19, _descriptor20;

  var AutoCompleteCustomElement = exports.AutoCompleteCustomElement = (_dec = (0, _aureliaViewManager.resolvedView)('spoonx/auto-complete', 'autocomplete'), _dec2 = (0, _aureliaFramework.inject)(_aureliaApi.Config, _aureliaPal.DOM.Element), _dec3 = (0, _aureliaFramework.bindable)({ defaultBindingMode: _aureliaFramework.bindingMode.twoWay }), _dec4 = (0, _aureliaFramework.bindable)({ defaultBindingMode: _aureliaFramework.bindingMode.twoWay }), _dec5 = (0, _aureliaFramework.bindable)({ defaultBindingMode: _aureliaFramework.bindingMode.twoWay }), _dec6 = (0, _aureliaFramework.computedFrom)('results', 'value'), _dec7 = (0, _aureliaFramework.computedFrom)('value'), _dec(_class = _dec2(_class = (_class2 = function () {
    _createClass(AutoCompleteCustomElement, [{
      key: "showFooter",
      get: function get() {
        var visibility = this.footerVisibility;

        return visibility === 'always' || visibility === 'no-results' && this.value && this.value.length && (!this.results || !this.results.length);
      }
    }]);

    function AutoCompleteCustomElement(api, element) {
      

      this.justSelected = false;
      this.previousValue = null;
      this.initial = true;
      this.hasFocus = false;

      _initDefineProp(this, "minInput", _descriptor, this);

      _initDefineProp(this, "name", _descriptor2, this);

      _initDefineProp(this, "limit", _descriptor3, this);

      _initDefineProp(this, "debounce", _descriptor4, this);

      _initDefineProp(this, "resource", _descriptor5, this);

      _initDefineProp(this, "items", _descriptor6, this);

      _initDefineProp(this, "value", _descriptor7, this);

      _initDefineProp(this, "selected", _descriptor8, this);

      _initDefineProp(this, "attribute", _descriptor9, this);

      _initDefineProp(this, "result", _descriptor10, this);

      _initDefineProp(this, "results", _descriptor11, this);

      _initDefineProp(this, "populate", _descriptor12, this);

      _initDefineProp(this, "footerLabel", _descriptor13, this);

      _initDefineProp(this, "footerSelected", _descriptor14, this);

      _initDefineProp(this, "footerVisibility", _descriptor15, this);

      _initDefineProp(this, "label", _descriptor16, this);

      _initDefineProp(this, "endpoint", _descriptor17, this);

      _initDefineProp(this, "placeholder", _descriptor18, this);

      _initDefineProp(this, "sort", _descriptor19, this);

      _initDefineProp(this, "criteria", _descriptor20, this);

      this.element = element;
      this.apiEndpoint = api;
    }

    AutoCompleteCustomElement.prototype.bind = function bind() {
      if (!this.resource && !this.items) {
        return _aureliaAutocomplete.logger.error('auto complete requires resource or items bindable to be defined');
      }

      this.value = this.label(this.result);
      this.apiEndpoint = this.apiEndpoint.getEndpoint(this.endpoint);
    };

    AutoCompleteCustomElement.prototype.setFocus = function setFocus(value, event) {
      function isDescendant(parent, child) {
        var node = child.parentNode;

        while (node !== null) {
          if (node === parent) {
            return true;
          }

          node = node.parentNode;
        }

        return false;
      }

      if (event && event.relatedTarget && isDescendant(this.element, event.relatedTarget)) {
        return true;
      }

      if (!this.hasEnoughCharacters()) {
        this.hasFocus = false;

        return true;
      }

      if (value) {
        this.valueChanged();
      }

      this.hasFocus = value;
    };

    AutoCompleteCustomElement.prototype.labelWithMatches = function labelWithMatches(result) {
      var label = this.label(result);

      if (typeof label !== 'string') {
        return '';
      }

      return label.replace(this.regex, function (match) {
        return "<strong>" + match + "</strong>";
      });
    };

    AutoCompleteCustomElement.prototype.handleKeyUp = function handleKeyUp(event) {
      if (event.keyCode !== 27) {
        return;
      }

      if (this.hasFocus) {
        event.stopPropagation();
      }

      this.setFocus(false);

      return true;
    };

    AutoCompleteCustomElement.prototype.handleKeyDown = function handleKeyDown(event) {
      if (event.keyCode === 27) {
        return;
      }

      if (event.keyCode === 40 || event.keyCode === 38) {
        this.selected = this.nextFoundResult(this.selected, event.keyCode === 38);

        return event.preventDefault();
      }

      if (event.keyCode === 9 || event.keyCode === 13) {
        if (this.hasFocus) {
          event.stopPropagation();
          event.preventDefault();
        }

        if (this.results.length !== 0) {
          this.onSelect();
        }
      } else {
        this.setFocus(true);
      }

      return true;
    };

    AutoCompleteCustomElement.prototype.nextFoundResult = function nextFoundResult(current, reversed) {
      var index = (this.results.indexOf(current) + (reversed ? -1 : 1)) % this.results.length;

      if (index < 0) {
        index = this.results.length - 1;
      }

      return this.results[index];
    };

    AutoCompleteCustomElement.prototype.onSelect = function onSelect(result) {
      result = arguments.length === 0 ? this.selected : result;
      this.justSelected = true;
      this.value = this.label(result);
      this.previousValue = this.value;
      this.result = result;
      this.selected = this.result;

      this.setFocus(false);

      return true;
    };

    AutoCompleteCustomElement.prototype.valueChanged = function valueChanged() {
      var _this = this;

      if (!this.shouldPerformRequest()) {
        return Promise.resolve();
      }

      this.result = null;

      if (!this.hasEnoughCharacters()) {
        this.results = [];

        return Promise.resolve();
      }

      if (this.items) {
        this.results = this.sort(this.filter(this.items));

        return Promise.resolve();
      }

      var lastFindPromise = this.findResults(this.searchQuery(this.value)).then(function (results) {
        if (_this.lastFindPromise !== lastFindPromise) {
          return;
        }

        _this.previousValue = _this.value;
        _this.lastFindPromise = false;
        _this.results = _this.sort(results || []);

        if (_this.results.length !== 0) {
          _this.selected = _this.results[0];
        }
      });

      this.lastFindPromise = lastFindPromise;
    };

    AutoCompleteCustomElement.prototype.filter = function filter(items) {
      var _this2 = this;

      var results = [];

      items.some(function (item) {
        if (_this2.itemMatches(item)) {
          results.push(item);
        }

        return results.length >= _this2.limit;
      });

      return results;
    };

    AutoCompleteCustomElement.prototype.itemMatches = function itemMatches(item) {
      return this.regex.test(this.label(item));
    };

    AutoCompleteCustomElement.prototype.shouldPerformRequest = function shouldPerformRequest() {
      if (this.justSelected === true) {
        this.justSelected = false;

        return false;
      }

      if (this.initial) {
        this.initial = false;

        return true;
      }

      return this.value !== this.previousValue;
    };

    AutoCompleteCustomElement.prototype.hasEnoughCharacters = function hasEnoughCharacters() {
      return (this.value && this.value.length || 0) >= this.minInput;
    };

    AutoCompleteCustomElement.prototype.findResults = function findResults(query) {
      return this.apiEndpoint.find(this.resource, query).catch(function (err) {
        return _aureliaAutocomplete.logger.error('not able to find results', err);
      });
    };

    AutoCompleteCustomElement.prototype.onFooterSelected = function onFooterSelected(value) {
      if (typeof this.footerSelected === 'function') {
        this.footerSelected(value);

        return;
      }

      this.element.dispatchEvent(_aureliaPal.DOM.createCustomEvent('footer-selected', { detail: { value: value } }));
    };

    AutoCompleteCustomElement.prototype.searchQuery = function searchQuery(string) {
      var ors = [];
      var where = void 0;

      if (Array.isArray(this.attribute)) {
        this.attribute.forEach(function (attribute) {
          var _ors$push;

          ors.push((_ors$push = {}, _ors$push[attribute] = { contains: string }, _ors$push));
        });
      } else {
        var _where;

        where = (_where = {}, _where[this.attribute] = { contains: string }, _where);
      }

      var mergedWhere = Object.assign(Array.isArray(this.attribute) ? { or: ors } : where, this.criteria);

      var query = {
        populate: this.populate || 'null',
        where: mergedWhere
      };

      if (this.limit) {
        query.limit = this.limit;
      }

      return query;
    };

    _createClass(AutoCompleteCustomElement, [{
      key: "regex",
      get: function get() {
        return new RegExp(this.value, 'gi');
      }
    }]);

    return AutoCompleteCustomElement;
  }(), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "minInput", [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: function initializer() {
      return 0;
    }
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "name", [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: function initializer() {
      return '';
    }
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "limit", [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: function initializer() {
      return 10;
    }
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "debounce", [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: function initializer() {
      return 100;
    }
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "resource", [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "items", [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "value", [_dec3], {
    enumerable: true,
    initializer: function initializer() {
      return '';
    }
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "selected", [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "attribute", [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: function initializer() {
      return 'name';
    }
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "result", [_dec4], {
    enumerable: true,
    initializer: function initializer() {
      return null;
    }
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "results", [_dec5], {
    enumerable: true,
    initializer: function initializer() {
      return [];
    }
  }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "populate", [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: function initializer() {
      return null;
    }
  }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "footerLabel", [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: function initializer() {
      return 'Create';
    }
  }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "footerSelected", [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: null
  }), _descriptor15 = _applyDecoratedDescriptor(_class2.prototype, "footerVisibility", [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: function initializer() {
      return 'never';
    }
  }), _descriptor16 = _applyDecoratedDescriptor(_class2.prototype, "label", [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: function initializer() {
      var _this3 = this;

      return function (result) {
        var defaultAttribute = Array.isArray(_this3.attribute) ? _this3.attribute[0] || 'name' : _this3.attribute;

        return (typeof result === "undefined" ? "undefined" : _typeof(result)) === 'object' && result !== null ? result[defaultAttribute] : result;
      };
    }
  }), _descriptor17 = _applyDecoratedDescriptor(_class2.prototype, "endpoint", [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: null
  }), _descriptor18 = _applyDecoratedDescriptor(_class2.prototype, "placeholder", [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: function initializer() {
      return 'Search';
    }
  }), _descriptor19 = _applyDecoratedDescriptor(_class2.prototype, "sort", [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: function initializer() {
      return function (items) {
        return items;
      };
    }
  }), _descriptor20 = _applyDecoratedDescriptor(_class2.prototype, "criteria", [_aureliaFramework.bindable], {
    enumerable: true,
    initializer: function initializer() {
      return {};
    }
  }), _applyDecoratedDescriptor(_class2.prototype, "showFooter", [_dec6], Object.getOwnPropertyDescriptor(_class2.prototype, "showFooter"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "regex", [_dec7], Object.getOwnPropertyDescriptor(_class2.prototype, "regex"), _class2.prototype)), _class2)) || _class) || _class);
});