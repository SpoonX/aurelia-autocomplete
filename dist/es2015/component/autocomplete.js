var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _class, _desc, _value, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _descriptor17, _descriptor18, _descriptor19, _descriptor20;

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

import { computedFrom, inject, bindable, bindingMode } from "aurelia-framework";
import { Config } from "aurelia-api";
import { logger } from "../aurelia-autocomplete";
import { DOM } from "aurelia-pal";
import { resolvedView } from "aurelia-view-manager";

export let AutoCompleteCustomElement = (_dec = resolvedView('spoonx/auto-complete', 'autocomplete'), _dec2 = inject(Config, DOM.Element), _dec3 = bindable({ defaultBindingMode: bindingMode.twoWay }), _dec4 = bindable({ defaultBindingMode: bindingMode.twoWay }), _dec5 = bindable({ defaultBindingMode: bindingMode.twoWay }), _dec6 = computedFrom('results', 'value'), _dec7 = computedFrom('value'), _dec(_class = _dec2(_class = (_class2 = class AutoCompleteCustomElement {
  get showFooter() {
    let visibility = this.footerVisibility;

    return visibility === 'always' || visibility === 'no-results' && this.value && this.value.length && (!this.results || !this.results.length);
  }

  constructor(api, element) {
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

  bind() {
    if (!this.resource && !this.items) {
      return logger.error('auto complete requires resource or items bindable to be defined');
    }

    this.value = this.label(this.result);
    this.apiEndpoint = this.apiEndpoint.getEndpoint(this.endpoint);
  }

  setFocus(value, event) {
    function isDescendant(parent, child) {
      let node = child.parentNode;

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

    if (value) {
      return this.valueChanged();
    }

    this.hasFocus = value;
  }

  labelWithMatches(result) {
    let label = this.label(result);

    if (typeof label !== 'string') {
      return '';
    }

    return label.replace(this.regex, match => {
      return `<strong>${match}</strong>`;
    });
  }

  handleKeyUp(event) {
    if (event.keyCode !== 27) {
      return;
    }

    if (this.hasFocus) {
      event.stopPropagation();
    }

    this.setFocus(false);

    return true;
  }

  handleKeyDown(event) {
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

      if (this.results.length !== 0 && this.hasFocus) {
        this.onSelect();
      }
    } else if (event.keyCode !== 37 && event.keyCode !== 39) {
      this.setFocus(true);
    }

    return true;
  }

  nextFoundResult(current, reversed) {
    let index = (this.results.indexOf(current) + (reversed ? -1 : 1)) % this.results.length;

    if (index < 0) {
      index = this.results.length - 1;
    }

    return this.results[index];
  }

  onSelect(result) {
    result = arguments.length === 0 ? this.selected : result;
    this.justSelected = true;
    this.value = this.label(result);
    this.previousValue = this.value;
    this.result = result;
    this.selected = this.result;

    this.setFocus(false);

    return true;
  }

  valueChanged() {
    if (!this.shouldPerformRequest()) {
      this.previousValue = this.value;
      this.hasFocus = !(this.results.length === 0);

      return Promise.resolve();
    }

    this.result = null;

    if (!this.hasEnoughCharacters()) {
      this.results = [];
      this.previousValue = this.value;
      this.hasFocus = false;

      return Promise.resolve();
    }

    this.hasFocus = true;

    if (this.items) {
      this.results = this.sort(this.filter(this.items));

      return Promise.resolve();
    }

    let lastFindPromise = this.findResults(this.searchQuery(this.value)).then(results => {
      if (this.lastFindPromise !== lastFindPromise) {
        return;
      }

      this.previousValue = this.value;
      this.lastFindPromise = false;
      this.results = this.sort(results || []);

      if (this.results.length !== 0) {
        this.selected = this.results[0];
      }
    });

    this.lastFindPromise = lastFindPromise;
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
    return new RegExp(this.value, 'gi');
  }

  shouldPerformRequest() {
    if (this.justSelected === true) {
      this.justSelected = false;

      return false;
    }

    if (this.initial) {
      this.initial = false;

      return true;
    }

    return this.value !== this.previousValue;
  }

  hasEnoughCharacters() {
    return (this.value && this.value.length || 0) >= this.minInput;
  }

  findResults(query) {
    return this.apiEndpoint.find(this.resource, query).catch(err => logger.error('not able to find results', err));
  }

  onFooterSelected(value) {
    if (typeof this.footerSelected === 'function') {
      this.footerSelected(value);

      return;
    }

    this.element.dispatchEvent(DOM.createCustomEvent('footer-selected', { detail: { value } }));
  }

  searchQuery(string) {
    let ors = [];
    let where;

    if (Array.isArray(this.attribute)) {
      this.attribute.forEach(attribute => {
        ors.push({ [attribute]: { contains: string } });
      });
    } else {
      where = { [this.attribute]: { contains: string } };
    }

    let mergedWhere = Object.assign(Array.isArray(this.attribute) ? { or: ors } : where, this.criteria);

    let query = {
      populate: this.populate || 'null',
      where: mergedWhere
    };

    if (this.limit) {
      query.limit = this.limit;
    }

    return query;
  }
}, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "minInput", [bindable], {
  enumerable: true,
  initializer: function () {
    return 0;
  }
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "name", [bindable], {
  enumerable: true,
  initializer: function () {
    return '';
  }
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "limit", [bindable], {
  enumerable: true,
  initializer: function () {
    return 10;
  }
}), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "debounce", [bindable], {
  enumerable: true,
  initializer: function () {
    return 100;
  }
}), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "resource", [bindable], {
  enumerable: true,
  initializer: null
}), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "items", [bindable], {
  enumerable: true,
  initializer: null
}), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "value", [_dec3], {
  enumerable: true,
  initializer: function () {
    return '';
  }
}), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "selected", [bindable], {
  enumerable: true,
  initializer: null
}), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "attribute", [bindable], {
  enumerable: true,
  initializer: function () {
    return 'name';
  }
}), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "result", [_dec4], {
  enumerable: true,
  initializer: function () {
    return null;
  }
}), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "results", [_dec5], {
  enumerable: true,
  initializer: function () {
    return [];
  }
}), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "populate", [bindable], {
  enumerable: true,
  initializer: function () {
    return null;
  }
}), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "footerLabel", [bindable], {
  enumerable: true,
  initializer: function () {
    return 'Create';
  }
}), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "footerSelected", [bindable], {
  enumerable: true,
  initializer: null
}), _descriptor15 = _applyDecoratedDescriptor(_class2.prototype, "footerVisibility", [bindable], {
  enumerable: true,
  initializer: function () {
    return 'never';
  }
}), _descriptor16 = _applyDecoratedDescriptor(_class2.prototype, "label", [bindable], {
  enumerable: true,
  initializer: function () {
    return result => {
      let defaultAttribute = Array.isArray(this.attribute) ? this.attribute[0] || 'name' : this.attribute;

      return typeof result === 'object' && result !== null ? result[defaultAttribute] : result;
    };
  }
}), _descriptor17 = _applyDecoratedDescriptor(_class2.prototype, "endpoint", [bindable], {
  enumerable: true,
  initializer: null
}), _descriptor18 = _applyDecoratedDescriptor(_class2.prototype, "placeholder", [bindable], {
  enumerable: true,
  initializer: function () {
    return 'Search';
  }
}), _descriptor19 = _applyDecoratedDescriptor(_class2.prototype, "sort", [bindable], {
  enumerable: true,
  initializer: function () {
    return items => items;
  }
}), _descriptor20 = _applyDecoratedDescriptor(_class2.prototype, "criteria", [bindable], {
  enumerable: true,
  initializer: function () {
    return {};
  }
}), _applyDecoratedDescriptor(_class2.prototype, "showFooter", [_dec6], Object.getOwnPropertyDescriptor(_class2.prototype, "showFooter"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "regex", [_dec7], Object.getOwnPropertyDescriptor(_class2.prototype, "regex"), _class2.prototype)), _class2)) || _class) || _class);