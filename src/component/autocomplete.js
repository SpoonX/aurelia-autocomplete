import {computedFrom, inject, bindable, TaskQueue, bindingMode} from 'aurelia-framework';
import {Config}                                                 from 'aurelia-api';
import {logger}                                                 from '../aurelia-autocomplete';
import {DOM}                                                    from 'aurelia-pal';
import {resolvedView}                                           from 'aurelia-view-manager';

@resolvedView('spoonx/auto-complete', 'autocomplete')
@inject(DOM, Config, DOM.Element, TaskQueue)
export class AutoCompleteCustomElement {

  lastFindPromise;

  // the query string is set after selecting an option. To avoid this
  // triggering a new query we set the justSelected to true. When true it will
  // avoid performing a query until it is toggled of.
  justSelected = false;

  // stores a list of object representations of listeners
  listeners        = [];
  liEventListeners = [];

  hasFocus = false;

  setFocus(value) {
    this.hasFocus = value;
  }

  //the max amount of results to return. (optional)
  @bindable limit = 10;

  //the string that is appended to the api endpoint. e.g. api.com/language.
  //language is the resource.
  @bindable resource;

  // used when one already has a list of items to filter on. Requests is not
  // necessary
  @bindable items;

  //the string to be used to do a contains search with. By default it will look
  //if the name contains this value
  @bindable search = '';

  //can be used to select default element visually
  @bindable selected;

  //the property to query on.
  @bindable attribute = 'name';

  //used to pass the "selected" value to the user's view model
  @bindable({defaultBindingMode: bindingMode.twoWay}) value = null;

  //the results returned from the endpoint. These can be observed and
  //mutated.
  @bindable({defaultBindingMode: bindingMode.twoWay}) results = [];

  //used to determine the string to be shown as option label
  @bindable label = result => {
    return (result && result[this.attribute]) || ''
  }

  // allow to overwrite the default apiEndpoint
  @bindable endpoint;

  // sort method that takes a list and returns a sorted list. No sorting by
  // default.
  @bindable sort = items => items;

  // used to make the criteria more specific
  @bindable criteria = {};

  constructor(dom, api, element, queue) {
    this.queue       = queue;
    this.element     = element;
    this.dom         = dom;
    this.apiEndpoint = api;
  }

  bind() {
    if (!this.resource && !this.items) {
      return logger.error('auto complete requires resource or items bindable to be defined');
    }

    this.search       = this.label(this.value);
    this.justSelected = true;

    this.apiEndpoint = this.apiEndpoint.getEndpoint(this.endpoint);
  }

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
    '*'  : '*'
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

    if (typeof label !== 'string') {
      // prevent label element to not have proper height by defining a string
      // with space when label is not a string
      return ' ';
    }

    return label.replace(this.regex, match => {
      return `<strong>${match}</strong>`;
    });
  }

  /**
   * Prepares the DOM by adding event listeners
   */
  attached() {
    this.inputElement    = this.element.querySelectorAll('input')[0];
    this.dropdownElement = this.element.querySelectorAll('.dropdown.open')[0];

    this.registerKeyDown(this.inputElement, '*', event => {
      this.dropdownElement.className = 'dropdown open';
    });

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
  }

  /**
   * @param {Object} current selected item
   * @param {Boolean} reversed when true gets the previous instead
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
   * @param {Object} [result] when defined uses the result instead of the
   * this.selected value
   */
  onSelect(result) {
    this.value        = (arguments.length === 0) ? this.selected : result;
    this.results      = [];
    this.justSelected = true;
    this.search       = this.label(this.value);
  }

  /**
   * when search string changes perform a request, assign it to results
   * and select the first result by default.
   *
   * @param {string} newValue
   * @param {string} oldValue
   *
   * @returns {Promise}
   */
  searchChanged(newValue, oldValue) {
    if (!this.shouldPerformRequest()) {
      this.results = [];

      return Promise.resolve();
    }

    // when resource is not defined it will not perform a request. Instead it
    // will search for the first items that pass the predicate
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
        this.selected    = this.results[0];
        this.value       = this.selected;
      }
    });
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

  @computedFrom('search')
  get regex() {
    return new RegExp(this.search, 'gi');
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

    return true;
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
      where: mergedWhere
    };

    // only assign limit to query if it is defined. Allows to default to server
    // limit when limit bindable is set to falsy value
    if (this.limit) {
      query.limit = this.limit;
    }

    return query;
  }
}
