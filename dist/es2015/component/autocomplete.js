var _dec, _dec2, _dec3, _dec4, _dec5, _class, _desc, _value, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12;

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

import { computedFrom, inject, bindable, TaskQueue, bindingMode } from 'aurelia-framework';
import { Config } from 'aurelia-api';
import { logger } from '../aurelia-autocomplete';
import { DOM } from 'aurelia-pal';
import { resolvedView } from 'aurelia-view-manager';

export let AutoCompleteCustomElement = (_dec = resolvedView('spoonx/auto-complete', 'autocomplete'), _dec2 = inject(DOM, Config, DOM.Element, TaskQueue), _dec3 = bindable({ defaultBindingMode: bindingMode.twoWay }), _dec4 = bindable({ defaultBindingMode: bindingMode.twoWay }), _dec5 = computedFrom('search'), _dec(_class = _dec2(_class = (_class2 = class AutoCompleteCustomElement {

  constructor(dom, api, element, queue) {
    this.justSelected = false;
    this.listeners = [];
    this.liEventListeners = [];

    _initDefineProp(this, 'limit', _descriptor, this);

    _initDefineProp(this, 'resource', _descriptor2, this);

    _initDefineProp(this, 'items', _descriptor3, this);

    _initDefineProp(this, 'search', _descriptor4, this);

    _initDefineProp(this, 'selected', _descriptor5, this);

    _initDefineProp(this, 'attribute', _descriptor6, this);

    _initDefineProp(this, 'value', _descriptor7, this);

    _initDefineProp(this, 'results', _descriptor8, this);

    _initDefineProp(this, 'label', _descriptor9, this);

    _initDefineProp(this, 'endpoint', _descriptor10, this);

    _initDefineProp(this, 'sort', _descriptor11, this);

    _initDefineProp(this, 'criteria', _descriptor12, this);

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

  bind() {
    if (!this.resource && !this.items) {
      return logger.error('auto complete requires resource or items bindable to be defined');
    }

    this.search = this.label(this.value);
    this.justSelected = true;

    this.apiEndpoint = this.apiEndpoint.getEndpoint(this.endpoint);
  }

  registerKeyDown(element, keyName, eventCallback) {
    let eventFunction = event => {
      if (this.keyCodes[keyName] === event.keyCode || keyName === '*') {
        eventCallback(event);
      }
    };

    this.listeners.push({
      element: element,
      callback: eventCallback,
      eventName: 'keydown'
    });

    element.addEventListener('keydown', eventFunction);
  }

  detached() {
    this.removeEventListeners(this.listeners);
  }

  removeEventListeners(listeners) {
    listeners.forEach(listener => {
      listener.element.removeEventListener(listener.eventName, listener.callback);
    });
  }

  labelWithMatches(result) {
    let label = this.label(result);

    if (!label.replace) {
      return '';
    }

    return label.replace(this.regex, match => {
      return `<strong>${ match }</strong>`;
    });
  }

  attached() {
    this.inputElement = this.element.querySelectorAll('input')[0];
    this.dropdownElement = this.element.querySelectorAll('.dropdown.open')[0];

    this.registerKeyDown(this.inputElement, '*', event => {
      this.dropdownElement.className = 'dropdown open';
    });

    this.registerKeyDown(this.inputElement, 'down', event => {
      this.selected = this.nextFoundResult(this.selected);

      event.preventDefault();
    });

    this.registerKeyDown(this.inputElement, 'up', event => {
      this.selected = this.nextFoundResult(this.selected, true);

      event.preventDefault();
    });

    this.registerKeyDown(this.inputElement, 'enter', () => this.onSelect());

    this.registerKeyDown(this.inputElement, 'tab', () => this.onSelect());
  }

  nextFoundResult(current, reversed) {
    let index = (this.results.indexOf(current) + (reversed ? -1 : 1)) % this.results.length;

    if (index < 0) {
      index = this.results.length - 1;
    }

    return this.results[index];
  }

  onSelect(result) {
    this.value = arguments.length === 0 ? this.selected : result;
    this.results = [];
    this.justSelected = true;
    this.search = this.label(this.value);
  }

  searchChanged(newValue, oldValue) {
    if (!this.shouldPerformRequest()) {
      this.results = [];

      return Promise.resolve();
    }

    if (this.items) {
      this.results = this.sort(this.filter(this.items));

      return Promise.resolve();
    }

    this.lastFindPromise = this.findResults(this.searchQuery(this.search)).then(results => {
      if (this.lastFindPromise !== promise) {
        return;
      }

      this.lastFindPromise = false;

      this.results = this.sort(results);

      if (this.results.length !== 0) {
        this.selected = this.results[0];
        this.value = this.selected;
      }
    });
  }

  filter(items) {
    let results = [];

    items.some(item => {
      if (this.itemMatches(item)) {
        results.push(item);
      }

      return results.length >= this.limit;
    });

    return results;
  }

  itemMatches(item) {
    return this.regex.test(this.label(item));
  }

  get regex() {
    return new RegExp(this.search, 'gi');
  }

  shouldPerformRequest() {
    if (this.justSelected === true) {
      this.justSelected = false;

      return false;
    }

    return true;
  }

  findResults(query) {
    return this.apiEndpoint.find(this.resource, query).catch(err => logger.error('not able to find results', err));
  }

  searchQuery(string) {
    let mergedWhere = Object.assign({ [this.attribute]: { contains: string } }, this.criteria);

    let query = {
      where: mergedWhere
    };

    if (this.limit) {
      query.limit = this.limit;
    }

    return query;
  }
}, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, 'limit', [bindable], {
  enumerable: true,
  initializer: function () {
    return 10;
  }
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, 'resource', [bindable], {
  enumerable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, 'items', [bindable], {
  enumerable: true,
  initializer: null
}), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, 'search', [bindable], {
  enumerable: true,
  initializer: function () {
    return '';
  }
}), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, 'selected', [bindable], {
  enumerable: true,
  initializer: null
}), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, 'attribute', [bindable], {
  enumerable: true,
  initializer: function () {
    return 'name';
  }
}), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, 'value', [_dec3], {
  enumerable: true,
  initializer: function () {
    return null;
  }
}), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, 'results', [_dec4], {
  enumerable: true,
  initializer: function () {
    return [];
  }
}), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, 'label', [bindable], {
  enumerable: true,
  initializer: function () {
    return result => {
      return typeof result === 'object' ? result[this.attribute] : result;
    };
  }
}), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, 'endpoint', [bindable], {
  enumerable: true,
  initializer: null
}), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, 'sort', [bindable], {
  enumerable: true,
  initializer: function () {
    return items => items;
  }
}), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, 'criteria', [bindable], {
  enumerable: true,
  initializer: function () {
    return {};
  }
}), _applyDecoratedDescriptor(_class2.prototype, 'regex', [_dec5], Object.getOwnPropertyDescriptor(_class2.prototype, 'regex'), _class2.prototype)), _class2)) || _class) || _class);