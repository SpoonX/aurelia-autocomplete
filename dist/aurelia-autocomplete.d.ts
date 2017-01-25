import {Config as ViewManager,resolvedView} from 'aurelia-view-manager';
import {getLogger} from 'aurelia-logging';
import {computedFrom,inject,bindable,bindingMode} from 'aurelia-framework';
import {Config} from 'aurelia-api';
import {DOM} from 'aurelia-pal';

/* Import all modules that can be concated, eg. ValueConverters, CustomElements etc, for bundling.
 * Those also need to be added to spoonx.js 'importsToAdd' and 'jsResources' and
 * the package.json's' "aurelia.build.resources" (there without extension if view/view-model and with
 * .html extension for views without view-model).
*/
// // eslint-disable-line no-unused-vars
export declare {
  AutoCompleteCustomElement
} from 'aurelia-autocomplete/component/autocomplete';
export declare function configure(aurelia?: any, configCallback?: any): any;
export declare {
  logger
};
export declare class AutoCompleteCustomElement {
  lastFindPromise: any;
  
  // the query string is set after selecting an option. To avoid this
  // triggering a new query we set the justSelected to true. When true it will
  // avoid performing a query until it is toggled of.
  justSelected: any;
  
  // stores a list of object representations of listeners
  listeners: any;
  liEventListeners: any;
  hasFocus: any;
  setFocus(value?: any): any;
  limit: any;
  debounce: any;
  resource: any;
  items: any;
  search: any;
  selected: any;
  attribute: any;
  value: any;
  results: any;
  populate: any;
  label: any;
  endpoint: any;
  sort: any;
  criteria: any;
  constructor(api?: any, element?: any);
  bind(): any;
  
  /**
     * converts a human readable string to a event keyCode
     *
     * @param {string} keyName a human readable key representation
     *
     * @returns {number} which matches the keyCode
     */
  keyCodes: any;
  
  /**
     * registers a event listener for the keydown
     *
     * @param {Element}  element dom element
     * @param {string}   keyName human readable key name
     * @param {function} eventCallback to be called when event is triggered
     */
  registerKeyDown(element?: any, keyName?: any, eventCallback?: any): any;
  detached(): any;
  
  /**
     * removes event listeners from DOM
     *
     * @param {Object[]} listeners objects that represent a event listener
     */
  removeEventListeners(listeners?: any): any;
  
  /**
     * returns HTML that wraps matching substrings with strong tags.
     * If not a "stringable" it returns an empty string.
     *
     * @param {Object} result
     *
     * @returns {String}
     */
  labelWithMatches(result?: any): any;
  
  /**
     * Prepares the DOM by adding event listeners
     */
  attached(): any;
  
  /**
     * @param {Object} current selected item
     * @param {Boolean} reversed when true gets the previous instead
     *
     * @returns {Object} the next of previous item
     */
  nextFoundResult(current?: any, reversed?: any): any;
  
  /**
     * Set the text in the input to that of the selected item and set the
     * selected item as the value. Then hide the results(dropdown)
     *
     * @param {Object} [result] when defined uses the result instead of the
     * this.selected value
     */
  onSelect(result?: any): any;
  
  /**
     * when search string changes perform a request, assign it to results
     * and select the first result by default.
     *
     * @returns {Promise}
     */
  searchChanged(): any;
  
  /**
     * returns a list of length that is smaller or equal to the limit. The
     * default predicate is based on the regex
     *
     * @param {Object[]} items
     *
     * @returns {Object[]}
     */
  filter(items?: any): any;
  
  /**
     * returns true when the finding of matching results should continue
     *
     * @param {*} item
     *
     * @return {Boolean}
     */
  itemMatches(item?: any): any;
  regex: any;
  
  /**
     * returns true when a request will be performed on a search change
     *
     * @returns {Boolean}
     */
  shouldPerformRequest(): any;
  
  /**
     * @param {Object} query a waterline query object
     *
     * @returns {Promise} which resolves to the found results
     */
  findResults(query?: any): any;
  
  /**
     * Takes a string and converts to to a waterline query object that is used to
     * perform a forgiving search.
     *
     * @param {String} string the string to search with
     *
     * @returns {Object} a waterline query object
     */
  searchQuery(string?: any): any;
}