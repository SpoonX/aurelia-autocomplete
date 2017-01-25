'use strict';

System.register(['aurelia-framework', 'aurelia-api', '../aurelia-autocomplete', 'aurelia-pal', 'aurelia-view-manager'], function (_export, _context) {
  "use strict";

  var computedFrom, inject, bindable, TaskQueue, bindingMode, Config, logger, DOM, resolvedView, _typeof, _createClass, _dec, _dec2, _dec3, _dec4, _dec5, _class, _desc, _value, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, AutoCompleteCustomElement;

  function _initDefineProp(target, property, descriptor, context) {
    if (!descriptor) return;
    Object.defineProperty(target, property, {
      enumerable: descriptor.enumerable,
      configurable: descriptor.configurable,
      writable: descriptor.writable,
      value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
    });
  }

  

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

  return {
    setters: [function (_aureliaFramework) {
      computedFrom = _aureliaFramework.computedFrom;
      inject = _aureliaFramework.inject;
      bindable = _aureliaFramework.bindable;
      TaskQueue = _aureliaFramework.TaskQueue;
      bindingMode = _aureliaFramework.bindingMode;
    }, function (_aureliaApi) {
      Config = _aureliaApi.Config;
    }, function (_aureliaAutocomplete) {
      logger = _aureliaAutocomplete.logger;
    }, function (_aureliaPal) {
      DOM = _aureliaPal.DOM;
    }, function (_aureliaViewManager) {
      resolvedView = _aureliaViewManager.resolvedView;
    }],
    execute: function () {
      _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
      } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };

      _createClass = function () {
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

      _export('AutoCompleteCustomElement', AutoCompleteCustomElement = (_dec = resolvedView('spoonx/auto-complete', 'autocomplete'), _dec2 = inject(DOM, Config, DOM.Element, TaskQueue), _dec3 = bindable({ defaultBindingMode: bindingMode.twoWay }), _dec4 = bindable({ defaultBindingMode: bindingMode.twoWay }), _dec5 = computedFrom('search'), _dec(_class = _dec2(_class = (_class2 = function () {
        AutoCompleteCustomElement.prototype.setFocus = function setFocus(value) {
          this.hasFocus = value;
        };

        function AutoCompleteCustomElement(dom, api, element, queue) {
          

          this.justSelected = false;
          this.listeners = [];
          this.liEventListeners = [];
          this.hasFocus = false;

          _initDefineProp(this, 'limit', _descriptor, this);

          _initDefineProp(this, 'debounce', _descriptor2, this);

          _initDefineProp(this, 'resource', _descriptor3, this);

          _initDefineProp(this, 'items', _descriptor4, this);

          _initDefineProp(this, 'search', _descriptor5, this);

          _initDefineProp(this, 'selected', _descriptor6, this);

          _initDefineProp(this, 'attribute', _descriptor7, this);

          _initDefineProp(this, 'value', _descriptor8, this);

          _initDefineProp(this, 'results', _descriptor9, this);

          _initDefineProp(this, 'label', _descriptor10, this);

          _initDefineProp(this, 'endpoint', _descriptor11, this);

          _initDefineProp(this, 'sort', _descriptor12, this);

          _initDefineProp(this, 'criteria', _descriptor13, this);

          this.keyCodes = {
            down: 40,
            up: 38,
            enter: 13,
            tab: 9,
            '*': '*'
          };

          this.queue = queue;
          this.element = element;
          this.dom = dom;
          this.apiEndpoint = api;
        }

        AutoCompleteCustomElement.prototype.bind = function bind() {
          if (!this.resource && !this.items) {
            return logger.error('auto complete requires resource or items bindable to be defined');
          }

          this.search = this.label(this.value);
          this.justSelected = true;

          this.apiEndpoint = this.apiEndpoint.getEndpoint(this.endpoint);
        };

        AutoCompleteCustomElement.prototype.registerKeyDown = function registerKeyDown(element, keyName, eventCallback) {
          var _this = this;

          var eventFunction = function eventFunction(event) {
            if (_this.keyCodes[keyName] === event.keyCode || keyName === '*') {
              eventCallback(event);
            }
          };

          this.listeners.push({
            element: element,
            callback: eventCallback,
            eventName: 'keydown'
          });

          element.addEventListener('keydown', eventFunction);
        };

        AutoCompleteCustomElement.prototype.detached = function detached() {
          this.removeEventListeners(this.listeners);
        };

        AutoCompleteCustomElement.prototype.removeEventListeners = function removeEventListeners(listeners) {
          listeners.forEach(function (listener) {
            listener.element.removeEventListener(listener.eventName, listener.callback);
          });
        };

        AutoCompleteCustomElement.prototype.labelWithMatches = function labelWithMatches(result) {
          var label = this.label(result);

          if (!label.replace) {
            return '';
          }

          return label.replace(this.regex, function (match) {
            return '<strong>' + match + '</strong>';
          });
        };

        AutoCompleteCustomElement.prototype.attached = function attached() {
          var _this2 = this;

          this.inputElement = this.element.querySelectorAll('input')[0];
          this.dropdownElement = this.element.querySelectorAll('.dropdown.open')[0];

          this.registerKeyDown(this.inputElement, '*', function (event) {
            _this2.dropdownElement.className = 'dropdown open';
          });

          this.registerKeyDown(this.inputElement, 'down', function (event) {
            _this2.selected = _this2.nextFoundResult(_this2.selected);

            event.preventDefault();
          });

          this.registerKeyDown(this.inputElement, 'up', function (event) {
            _this2.selected = _this2.nextFoundResult(_this2.selected, true);

            event.preventDefault();
          });

          this.registerKeyDown(this.inputElement, 'enter', function () {
            return _this2.onSelect();
          });

          this.registerKeyDown(this.inputElement, 'tab', function () {
            return _this2.onSelect();
          });
        };

        AutoCompleteCustomElement.prototype.nextFoundResult = function nextFoundResult(current, reversed) {
          var index = (this.results.indexOf(current) + (reversed ? -1 : 1)) % this.results.length;

          if (index < 0) {
            index = this.results.length - 1;
          }

          return this.results[index];
        };

        AutoCompleteCustomElement.prototype.onSelect = function onSelect(result) {
          this.value = arguments.length === 0 ? this.selected : result;
          this.results = [];
          this.justSelected = true;
          this.search = this.label(this.value);
        };

        AutoCompleteCustomElement.prototype.searchChanged = function searchChanged(newValue, oldValue) {
          var _this3 = this;

          if (!this.shouldPerformRequest()) {
            this.results = [];

            return Promise.resolve();
          }

          if (this.items) {
            this.results = this.sort(this.filter(this.items));

            return Promise.resolve();
          }

          var lastFindPromise = this.findResults(this.searchQuery(this.search)).then(function (results) {
            if (_this3.lastFindPromise !== lastFindPromise) {
              return;
            }

            _this3.lastFindPromise = false;

            _this3.results = _this3.sort(results);

            if (_this3.results.length !== 0) {
              _this3.selected = _this3.results[0];
              _this3.value = _this3.selected;
            }
          });

          this.lastFindPromise = lastFindPromise;
        };

        AutoCompleteCustomElement.prototype.filter = function filter(items) {
          var _this4 = this;

          var results = [];

          items.some(function (item) {
            if (_this4.itemMatches(item)) {
              results.push(item);
            }

            return results.length >= _this4.limit;
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

          return true;
        };

        AutoCompleteCustomElement.prototype.findResults = function findResults(query) {
          return this.apiEndpoint.find(this.resource, query).catch(function (err) {
            return logger.error('not able to find results', err);
          });
        };

        AutoCompleteCustomElement.prototype.searchQuery = function searchQuery(string) {
          var _Object$assign;

          var mergedWhere = Object.assign((_Object$assign = {}, _Object$assign[this.attribute] = { contains: string }, _Object$assign), this.criteria);

          var query = {
            where: mergedWhere
          };

          if (this.limit) {
            query.limit = this.limit;
          }

          return query;
        };

        _createClass(AutoCompleteCustomElement, [{
          key: 'regex',
          get: function get() {
            return new RegExp(this.search, 'gi');
          }
        }]);

        return AutoCompleteCustomElement;
      }(), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, 'limit', [bindable], {
        enumerable: true,
        initializer: function initializer() {
          return 10;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, 'debounce', [bindable], {
        enumerable: true,
        initializer: function initializer() {
          return 100;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, 'resource', [bindable], {
        enumerable: true,
        initializer: null
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, 'items', [bindable], {
        enumerable: true,
        initializer: null
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, 'search', [bindable], {
        enumerable: true,
        initializer: function initializer() {
          return '';
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, 'selected', [bindable], {
        enumerable: true,
        initializer: null
      }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, 'attribute', [bindable], {
        enumerable: true,
        initializer: function initializer() {
          return 'name';
        }
      }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, 'value', [_dec3], {
        enumerable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, 'results', [_dec4], {
        enumerable: true,
        initializer: function initializer() {
          return [];
        }
      }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, 'label', [bindable], {
        enumerable: true,
        initializer: function initializer() {
          var _this5 = this;

          return function (result) {
            return (typeof result === 'undefined' ? 'undefined' : _typeof(result)) === 'object' ? result[_this5.attribute] : result;
          };
        }
      }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, 'endpoint', [bindable], {
        enumerable: true,
        initializer: null
      }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, 'sort', [bindable], {
        enumerable: true,
        initializer: function initializer() {
          return function (items) {
            return items;
          };
        }
      }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, 'criteria', [bindable], {
        enumerable: true,
        initializer: function initializer() {
          return {};
        }
      }), _applyDecoratedDescriptor(_class2.prototype, 'regex', [_dec5], Object.getOwnPropertyDescriptor(_class2.prototype, 'regex'), _class2.prototype)), _class2)) || _class) || _class));

      _export('AutoCompleteCustomElement', AutoCompleteCustomElement);
    }
  };
});