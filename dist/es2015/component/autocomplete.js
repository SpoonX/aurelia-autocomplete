var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { computedFrom, inject, bindable, bindingMode } from "aurelia-framework";
import { Config } from "aurelia-api";
import { logger } from "../aurelia-autocomplete";
import { DOM } from "aurelia-pal";
import { resolvedView } from "aurelia-view-manager";
let AutoCompleteCustomElement = class AutoCompleteCustomElement {
    /**
     * Autocomplete constructor.
     *
     * @param {Config}  api
     * @param {Element} element
     */
    constructor(api, element) {
        // the query string is set after selecting an option. To avoid this
        // triggering a new query we set the justSelected to true. When true it will
        // avoid performing a query until it is toggled of.
        this.justSelected = false;
        // Holds the value last used to perform a search
        this.previousValue = null;
        // Simple property that maintains if this is the initial (first) request.
        this.initial = true;
        this.hasFocus = false;
        // How many characters are required to type before starting a search.
        this.minInput = 0;
        // the name of the input element
        this.name = '';
        // The max amount of results to return. (optional)
        this.limit = 10;
        // Debounce value
        this.debounce = 100;
        // The string to be used to do a contains search with. By default it will look if the name contains this value.
        this.value = '';
        // The property to query on.
        this.attribute = 'name';
        // Used to pass the result of the selected value to the user's view model
        this.result = null;
        // The results returned from the endpoint. These can be observed and mutated.
        this.results = [];
        // Which relations to populate for results
        this.populate = null;
        // The label to show in the footer. Gets pulled through aurelia-i18n.
        this.footerLabel = 'Create';
        // Never, always or no-results
        this.footerVisibility = 'never';
        // Used to determine the string to be shown as option label
        this.label = (result) => {
            let defaultAttribute = Array.isArray(this.attribute) ? this.attribute[0] || 'name' : this.attribute;
            return typeof result === 'object' && result !== null ? result[defaultAttribute] : result;
        };
        // Input field's placeholder
        this.placeholder = 'Search';
        // Sort method that takes a list and returns a sorted list. No sorting by default.
        this.sort = (items) => items;
        // Used to make the criteria more specific
        this.criteria = {};
        this.element = element;
        this.apiEndpoint = api;
    }
    get showFooter() {
        let visibility = this.footerVisibility;
        return visibility === 'always'
            || (visibility === 'no-results' && this.value && this.value.length && (!this.results || !this.results.length));
    }
    /**
     * Bind callback.
     *
     * @returns {void}
     */
    bind() {
        if (!this.resource && !this.items) {
            return logger.error('auto complete requires resource or items bindable to be defined');
        }
        this.value = this.label(this.result);
        this.apiEndpoint = this.apiEndpoint.getEndpoint(this.endpoint);
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
            while (node !== null) {
                if (node === parent) {
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
            return this.valueChanged();
        }
        this.hasFocus = value;
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
            return '';
        }
        return label.replace(this.regex, match => {
            return `<strong>${match}</strong>`;
        });
    }
    /**
     * Handle keyUp events from value.
     *
     * @param {Event} event
     *
     * @returns {*}
     */
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
    /**
     * Handle keyDown events from value.
     *
     * @param {Event} event
     *
     * @returns {*}
     */
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
        }
        else if (event.keyCode !== 37 && event.keyCode !== 39) {
            this.setFocus(true);
        }
        return true;
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
     *
     * @returns {boolean}
     */
    onSelect(result) {
        result = (arguments.length === 0) ? this.selected : result;
        this.justSelected = true;
        this.value = this.label(result);
        this.previousValue = this.value;
        this.result = result;
        this.selected = this.result;
        this.setFocus(false);
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
        // when resource is not defined it will not perform a request. Instead it
        // will search for the first items that pass the predicate
        if (this.items) {
            this.results = this.sort(this.filter(this.items));
            return Promise.resolve();
        }
        let lastFindPromise = this.findResults(this.searchQuery(this.value))
            .then((results) => {
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
            return (results.length >= this.limit);
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
        if (this.initial) {
            this.initial = false;
            return true;
        }
        return this.value !== this.previousValue;
    }
    /**
     * Returns whether or not value has enough characters (meets minInput).
     *
     * @returns {boolean}
     */
    hasEnoughCharacters() {
        return ((this.value && this.value.length) || 0) >= this.minInput;
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
     * Emit custom event, or call function depending on supplied value.
     *
     * @param {string} value
     */
    onFooterSelected(value) {
        if (typeof this.footerSelected === 'function') {
            this.footerSelected(value);
            return;
        }
        this.element.dispatchEvent(DOM.createCustomEvent('footer-selected', { detail: { value } }));
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
        let ors = [];
        let where;
        if (Array.isArray(this.attribute)) {
            this.attribute.forEach(attribute => {
                ors.push({ [attribute]: { contains: string } });
            });
        }
        else {
            where = { [this.attribute]: { contains: string } };
        }
        let mergedWhere = Object.assign(Array.isArray(this.attribute) ? { or: ors } : where, this.criteria);
        let query = {
            populate: this.populate || 'null',
            where: mergedWhere
        };
        // only assign limit to query if it is defined. Allows to default to server
        // limit when limit bindable is set to falsy value
        if (this.limit) {
            query.limit = this.limit;
        }
        return query;
    }
};
__decorate([
    bindable,
    __metadata("design:type", Object)
], AutoCompleteCustomElement.prototype, "minInput", void 0);
__decorate([
    bindable,
    __metadata("design:type", Object)
], AutoCompleteCustomElement.prototype, "name", void 0);
__decorate([
    bindable,
    __metadata("design:type", Object)
], AutoCompleteCustomElement.prototype, "limit", void 0);
__decorate([
    bindable,
    __metadata("design:type", Object)
], AutoCompleteCustomElement.prototype, "debounce", void 0);
__decorate([
    bindable,
    __metadata("design:type", String)
], AutoCompleteCustomElement.prototype, "resource", void 0);
__decorate([
    bindable,
    __metadata("design:type", Array)
], AutoCompleteCustomElement.prototype, "items", void 0);
__decorate([
    bindable({ defaultBindingMode: bindingMode.twoWay }),
    __metadata("design:type", Object)
], AutoCompleteCustomElement.prototype, "value", void 0);
__decorate([
    bindable,
    __metadata("design:type", Object)
], AutoCompleteCustomElement.prototype, "selected", void 0);
__decorate([
    bindable,
    __metadata("design:type", Object)
], AutoCompleteCustomElement.prototype, "attribute", void 0);
__decorate([
    bindable({ defaultBindingMode: bindingMode.twoWay }),
    __metadata("design:type", Object)
], AutoCompleteCustomElement.prototype, "result", void 0);
__decorate([
    bindable({ defaultBindingMode: bindingMode.twoWay }),
    __metadata("design:type", Array)
], AutoCompleteCustomElement.prototype, "results", void 0);
__decorate([
    bindable,
    __metadata("design:type", Object)
], AutoCompleteCustomElement.prototype, "populate", void 0);
__decorate([
    bindable,
    __metadata("design:type", Object)
], AutoCompleteCustomElement.prototype, "footerLabel", void 0);
__decorate([
    bindable,
    __metadata("design:type", Function)
], AutoCompleteCustomElement.prototype, "footerSelected", void 0);
__decorate([
    bindable,
    __metadata("design:type", Object)
], AutoCompleteCustomElement.prototype, "footerVisibility", void 0);
__decorate([
    bindable,
    __metadata("design:type", Object)
], AutoCompleteCustomElement.prototype, "label", void 0);
__decorate([
    bindable,
    __metadata("design:type", Object)
], AutoCompleteCustomElement.prototype, "endpoint", void 0);
__decorate([
    bindable,
    __metadata("design:type", Object)
], AutoCompleteCustomElement.prototype, "placeholder", void 0);
__decorate([
    bindable,
    __metadata("design:type", Object)
], AutoCompleteCustomElement.prototype, "sort", void 0);
__decorate([
    bindable,
    __metadata("design:type", Object)
], AutoCompleteCustomElement.prototype, "criteria", void 0);
__decorate([
    computedFrom('results', 'value'),
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], AutoCompleteCustomElement.prototype, "showFooter", null);
__decorate([
    computedFrom('value'),
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], AutoCompleteCustomElement.prototype, "regex", null);
AutoCompleteCustomElement = __decorate([
    resolvedView('spoonx/auto-complete', 'autocomplete'),
    inject(Config, DOM.Element),
    __metadata("design:paramtypes", [typeof (_a = typeof Config !== "undefined" && Config) === "function" && _a || Object, Element])
], AutoCompleteCustomElement);
export { AutoCompleteCustomElement };
var _a;
