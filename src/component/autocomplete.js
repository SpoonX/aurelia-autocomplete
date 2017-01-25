import {computedFrom, inject, bindable, bindingMode} from "aurelia-framework";
import {Config} from "aurelia-api";
import {logger} from "../aurelia-autocomplete";
import {DOM} from "aurelia-pal";
import {resolvedView} from "aurelia-view-manager";

@resolvedView('spoonx/auto-complete', 'autocomplete')
@inject(Config, DOM.Element)
export class AutoCompleteCustomElement {

  lastFindPromise;

  // the query string is set after selecting an option. To avoid this
  // triggering a new query we set the justSelected to true. When true it will
  // avoid performing a query until it is toggled of.
  justSelected = false;

  // Holds the value last used to perform a search
  previousValue = null;

  // stores a list of object representations of listeners
  listeners        = [];
  liEventListeners = [];

  hasFocus = false;

  //the max amount of results to return. (optional)
  @bindable limit = 10;

  // Debounce value
  @bindable debounce = 100;

  //the string that is appended to the api endpoint. e.g. api.com/language.
  //language is the resource.
  @bindable resource;

  // used when one already has a list of items to filter on. Requests is not
  // necessary
  @bindable items;

  //the string to be used to do a contains search with. By default it will look
  //if the name contains this value
  @bindable({defaultBindingMode: bindingMode.twoWay}) value = '';

  //can be used to select default element visually
  @bindable selected;

  //the property to query on.
  @bindable attribute = 'name';

  //used to pass the result of the selected value to the user's view model
  @bindable({defaultBindingMode: bindingMode.twoWay}) result = null;

  //the results returned from the endpoint. These can be observed and
  //mutated.
  @bindable({defaultBindingMode: bindingMode.twoWay}) results = [];

  // Which relations to populate for results
  @bindable populate = null;

  // The label to show in the footer. Gets pulled through aurelia-i18n.
  @bindable footerLabel = 'Create';

  // Callback to call when the footer gets clicked.
  @bindable footerSelected = (value) => {
  };

  // Never, always or no-results
  @bindable footerVisibility = 'never';

  //used to determine the string to be shown as option label
  @bindable label = result => {
    return typeof result === 'object' ? result[this.attribute] : result;
  };

  // allow to overwrite the default apiEndpoint
  @bindable endpoint;

  // sort method that takes a list and returns a sorted list. No sorting by
  // default.
  @bindable sort = items => items;

  // used to make the criteria more specific
  @bindable criteria = {};

  /**
   * converts a human readable string to a event keyCode
   *
   * @param {string} keyName a human readable key representation
   *
   * @returns {number} which matches the keyCode
   */
  keyCodes = {
    down : 40,
    up   : 38,
    enter: 13,
    tab  : 9,
    esc  : 27,
    '*'  : '*'
  };

  @computedFrom('results', 'value')
  get showFooter() {
    let visibility = this.footerVisibility;

    return visibility === 'always' || (
        visibility === 'no-results' &&
        this.value &&
        this.value.length &&
        (!this.results || !this.results.length)
      );
  }

  constructor(api, element) {
    this.element     = element;
    this.apiEndpoint = api;
  }

  bind() {
    if (!this.resource && !this.items) {
      return logger.error('auto complete requires resource or items bindable to be defined');
    }

    this.value        = this.label(this.result);
    this.justSelected = true;
    this.apiEndpoint  = this.apiEndpoint.getEndpoint(this.endpoint);
  }

  /**
   * Set focus on dropdown.
   *
   * @param {boolean} value
   * @param {Event}   [event]
   *
   * @returns {boolean}
   */
  setFocus(value, event) {
    function isDescendant(parent, child) {
      let node = child.parentNode;

      while (node != null) {
        if (node == parent) {
          return true;
        }

        node = node.parentNode;
      }

      return false;
    }

    // If descendant, don't toggle dropdown so that other listeners will be called.
    if (event && event.relatedTarget && isDescendant(this.element, event.relatedTarget)) {
      return true;
    }

    if (value) {
      this.valueChanged();
    }

    this.hasFocus = value;
  }

  /**
   * registers a event listener for the keydown
   *
   * @param {Element}  element dom element
   * @param {string}   keyName human readable key name
   * @param {function} eventCallback to be called when event is triggered
   */
  registerKeyDown(element, keyName, eventCallback) {
    let eventFunction = event => {
      if (this.keyCodes[keyName] === event.keyCode || keyName === '*') {
        eventCallback(event);
      }
    };

    this.listeners.push({
      element  : element,
      callback : eventCallback,
      eventName: 'keydown'
    });

    element.addEventListener('keydown', eventFunction);
  }

  detached() {
    this.removeEventListeners(this.listeners);
  }

  /**
   * removes event listeners from DOM
   *
   * @param {Object[]} listeners objects that represent a event listener
   */
  removeEventListeners(listeners) {
    listeners.forEach(listener => {
      listener.element.removeEventListener(listener.eventName, listener.callback);
    });
  }

  /**
   * returns HTML that wraps matching substrings with strong tags.
   * If not a "stringable" it returns an empty string.
   *
   * @param {Object} result
   *
   * @returns {String}
   */
  labelWithMatches(result) {
    let label = this.label(result);

    if (!label.replace) {
      return '';
    }

    return label.replace(this.regex, match => {
      return `<strong>${match}</strong>`;
    });
  }

  /**
   * Prepares the DOM by adding event listeners
   */
  attached() {
    this.inputElement = this.element.querySelectorAll('input')[0];

    this.registerKeyDown(this.inputElement, '*', () => this.setFocus(true));

    this.registerKeyDown(this.inputElement, 'down', event => {
      this.selected = this.nextFoundResult(this.selected);
      // do not move the cursor
      event.preventDefault();
    });

    this.registerKeyDown(this.inputElement, 'up', event => {
      this.selected = this.nextFoundResult(this.selected, true);
      // do not move the cursor
      event.preventDefault();
    });

    this.registerKeyDown(this.inputElement, 'enter', () => this.onSelect());

    // tab closes the dropdown and jumps to the next tabable element (default behavior)
    this.registerKeyDown(this.inputElement, 'tab', () => this.onSelect());

    // tab closes the dropdown and jumps to the next tabable element (default behavior)
    this.registerKeyDown(this.inputElement, 'esc', () => this.setFocus(false));
  }

  /**
   * Get the next result in the list.
   *
   * @param {Object}  current    selected item
   * @param {Boolean} [reversed] when true gets the previous instead
   *
   * @returns {Object} the next of previous item
   */
  nextFoundResult(current, reversed) {
    let index = (this.results.indexOf(current) + (reversed ? -1 : 1)) % (this.results.length);

    if (index < 0) {
      index = this.results.length - 1;
    }

    return this.results[index];
  }

  /**
   * Set the text in the input to that of the selected item and set the
   * selected item as the value. Then hide the results(dropdown)
   *
   * @param {Object} [result] when defined uses the result instead of the this.selected value
   */
  onSelect(result) {
    result             = (arguments.length === 0) ? this.selected : result;
    this.justSelected  = true;
    this.value         = this.label(result);
    this.previousValue = this.value;

    this.setFocus(false);

    // Because of the event we're in, databinding updates don't get called. Just skip a beat. :)
    setTimeout(() => {
      this.result   = result;
      this.selected = this.result;
    }, 1);

    return true;
  }

  /**
   * when search string changes perform a request, assign it to results
   * and select the first result by default.
   *
   * @returns {Promise}
   */
  valueChanged() {
    if (!this.shouldPerformRequest()) {
      return Promise.resolve();
    }

    this.result = null;

    // when resource is not defined it will not perform a request. Instead it
    // will search for the first items that pass the predicate
    if (this.items) {
      this.results = this.sort(this.filter(this.items));

      return Promise.resolve();
    }

    let lastFindPromise = this.findResults(this.searchQuery(this.value))
      .then(results => {
        if (this.lastFindPromise !== lastFindPromise) {
          return;
        }

        this.previousValue   = this.value;
        this.lastFindPromise = false;
        this.results         = this.sort(results || []);

        if (this.results.length !== 0) {
          this.selected = this.results[0];
        }
      });

    this.lastFindPromise = lastFindPromise;
  }

  /**
   * returns a list of length that is smaller or equal to the limit. The
   * default predicate is based on the regex
   *
   * @param {Object[]} items
   *
   * @returns {Object[]}
   */
  filter(items) {
    let results = [];

    items.some(item => {
      // add an item if it matches
      if (this.itemMatches(item)) {
        results.push(item);
      }

      return (results.length >= this.limit)
    });

    return results;
  }

  /**
   * returns true when the finding of matching results should continue
   *
   * @param {*} item
   *
   * @return {Boolean}
   */
  itemMatches(item) {
    return this.regex.test(this.label(item));
  }

  @computedFrom('value')
  get regex() {
    return new RegExp(this.value, 'gi');
  }

  /**
   * returns true when a request will be performed on a search change
   *
   * @returns {Boolean}
   */
  shouldPerformRequest() {
    if (this.justSelected === true) {
      this.justSelected = false;

      return false;
    }

    return this.value !== this.previousValue;
  }

  /**
   * @param {Object} query a waterline query object
   *
   * @returns {Promise} which resolves to the found results
   */
  findResults(query) {
    return this.apiEndpoint.find(this.resource, query)
      .catch(err => logger.error('not able to find results', err));
  }

  /**
   * Takes a string and converts to to a waterline query object that is used to
   * perform a forgiving search.
   *
   * @param {String} string the string to search with
   *
   * @returns {Object} a waterline query object
   */
  searchQuery(string) {
    let mergedWhere = Object.assign(
      {[this.attribute]: {contains: string}},
      this.criteria
    );

    let query = {
      populate: this.populate || 'null',
      where   : mergedWhere
    };

    // only assign limit to query if it is defined. Allows to default to server
    // limit when limit bindable is set to falsy value
    if (this.limit) {
      query.limit = this.limit;
    }

    return query;
  }
}
