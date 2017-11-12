var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define(["require", "exports", "aurelia-framework", "aurelia-api", "../aurelia-autocomplete", "aurelia-pal", "aurelia-view-manager"], function (require, exports, aurelia_framework_1, aurelia_api_1, aurelia_autocomplete_1, aurelia_pal_1, aurelia_view_manager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var AutoCompleteCustomElement = /** @class */ (function () {
        /**
         * Autocomplete constructor.
         *
         * @param {Config}  api
         * @param {Element} element
         */
        function AutoCompleteCustomElement(api, element) {
            var _this = this;
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
            this.label = function (result) {
                var defaultAttribute = Array.isArray(_this.attribute) ? _this.attribute[0] || 'name' : _this.attribute;
                return typeof result === 'object' && result !== null ? result[defaultAttribute] : result;
            };
            // Input field's placeholder
            this.placeholder = 'Search';
            // Sort method that takes a list and returns a sorted list. No sorting by default.
            this.sort = function (items) { return items; };
            // Used to make the criteria more specific
            this.criteria = {};
            this.element = element;
            this.apiEndpoint = api;
        }
        Object.defineProperty(AutoCompleteCustomElement.prototype, "showFooter", {
            get: function () {
                var visibility = this.footerVisibility;
                return visibility === 'always'
                    || (visibility === 'no-results' && this.value && this.value.length && (!this.results || !this.results.length));
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Bind callback.
         *
         * @returns {void}
         */
        AutoCompleteCustomElement.prototype.bind = function () {
            if (!this.resource && !this.items) {
                return aurelia_autocomplete_1.logger.error('auto complete requires resource or items bindable to be defined');
            }
            this.value = this.label(this.result);
            this.apiEndpoint = this.apiEndpoint.getEndpoint(this.endpoint);
        };
        /**
         * Set focus on dropdown.
         *
         * @param {boolean} value
         * @param {Event}   [event]
         *
         * @returns {boolean}
         */
        AutoCompleteCustomElement.prototype.setFocus = function (value, event) {
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
            // If descendant, don't toggle dropdown so that other listeners will be called.
            if (event && event.relatedTarget && isDescendant(this.element, event.relatedTarget)) {
                return true;
            }
            if (value) {
                return this.valueChanged();
            }
            this.hasFocus = value;
        };
        /**
         * returns HTML that wraps matching substrings with strong tags.
         * If not a "stringable" it returns an empty string.
         *
         * @param {Object} result
         *
         * @returns {String}
         */
        AutoCompleteCustomElement.prototype.labelWithMatches = function (result) {
            var label = this.label(result);
            if (typeof label !== 'string') {
                return '';
            }
            return label.replace(this.regex, function (match) {
                return "<strong>" + match + "</strong>";
            });
        };
        /**
         * Handle keyUp events from value.
         *
         * @param {Event} event
         *
         * @returns {*}
         */
        AutoCompleteCustomElement.prototype.handleKeyUp = function (event) {
            if (event.keyCode !== 27) {
                return;
            }
            if (this.hasFocus) {
                event.stopPropagation();
            }
            this.setFocus(false);
            return true;
        };
        /**
         * Handle keyDown events from value.
         *
         * @param {Event} event
         *
         * @returns {*}
         */
        AutoCompleteCustomElement.prototype.handleKeyDown = function (event) {
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
        };
        /**
         * Get the next result in the list.
         *
         * @param {Object}  current    selected item
         * @param {Boolean} [reversed] when true gets the previous instead
         *
         * @returns {Object} the next of previous item
         */
        AutoCompleteCustomElement.prototype.nextFoundResult = function (current, reversed) {
            var index = (this.results.indexOf(current) + (reversed ? -1 : 1)) % (this.results.length);
            if (index < 0) {
                index = this.results.length - 1;
            }
            return this.results[index];
        };
        /**
         * Set the text in the input to that of the selected item and set the
         * selected item as the value. Then hide the results(dropdown)
         *
         * @param {Object} [result] when defined uses the result instead of the this.selected value
         *
         * @returns {boolean}
         */
        AutoCompleteCustomElement.prototype.onSelect = function (result) {
            result = (arguments.length === 0) ? this.selected : result;
            this.justSelected = true;
            this.value = this.label(result);
            this.previousValue = this.value;
            this.result = result;
            this.selected = this.result;
            this.setFocus(false);
            return true;
        };
        /**
         * when search string changes perform a request, assign it to results
         * and select the first result by default.
         *
         * @returns {Promise}
         */
        AutoCompleteCustomElement.prototype.valueChanged = function () {
            var _this = this;
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
            var lastFindPromise = this.findResults(this.searchQuery(this.value))
                .then(function (results) {
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
        /**
         * returns a list of length that is smaller or equal to the limit. The
         * default predicate is based on the regex
         *
         * @param {Object[]} items
         *
         * @returns {Object[]}
         */
        AutoCompleteCustomElement.prototype.filter = function (items) {
            var _this = this;
            var results = [];
            items.some(function (item) {
                // add an item if it matches
                if (_this.itemMatches(item)) {
                    results.push(item);
                }
                return (results.length >= _this.limit);
            });
            return results;
        };
        /**
         * returns true when the finding of matching results should continue
         *
         * @param {*} item
         *
         * @return {Boolean}
         */
        AutoCompleteCustomElement.prototype.itemMatches = function (item) {
            return this.regex.test(this.label(item));
        };
        Object.defineProperty(AutoCompleteCustomElement.prototype, "regex", {
            get: function () {
                return new RegExp(this.value, 'gi');
            },
            enumerable: true,
            configurable: true
        });
        /**
         * returns true when a request will be performed on a search change
         *
         * @returns {Boolean}
         */
        AutoCompleteCustomElement.prototype.shouldPerformRequest = function () {
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
        /**
         * Returns whether or not value has enough characters (meets minInput).
         *
         * @returns {boolean}
         */
        AutoCompleteCustomElement.prototype.hasEnoughCharacters = function () {
            return ((this.value && this.value.length) || 0) >= this.minInput;
        };
        /**
         * @param {Object} query a waterline query object
         *
         * @returns {Promise} which resolves to the found results
         */
        AutoCompleteCustomElement.prototype.findResults = function (query) {
            return this.apiEndpoint.find(this.resource, query)
                .catch(function (err) { return aurelia_autocomplete_1.logger.error('not able to find results', err); });
        };
        /**
         * Emit custom event, or call function depending on supplied value.
         *
         * @param {string} value
         */
        AutoCompleteCustomElement.prototype.onFooterSelected = function (value) {
            if (typeof this.footerSelected === 'function') {
                this.footerSelected(value);
                return;
            }
            this.element.dispatchEvent(aurelia_pal_1.DOM.createCustomEvent('footer-selected', { detail: { value: value } }));
        };
        /**
         * Takes a string and converts to to a waterline query object that is used to
         * perform a forgiving search.
         *
         * @param {String} string the string to search with
         *
         * @returns {Object} a waterline query object
         */
        AutoCompleteCustomElement.prototype.searchQuery = function (string) {
            var ors = [];
            var where;
            if (Array.isArray(this.attribute)) {
                this.attribute.forEach(function (attribute) {
                    ors.push((_a = {}, _a[attribute] = { contains: string }, _a));
                    var _a;
                });
            }
            else {
                where = (_a = {}, _a[this.attribute] = { contains: string }, _a);
            }
            var mergedWhere = Object.assign(Array.isArray(this.attribute) ? { or: ors } : where, this.criteria);
            var query = {
                populate: this.populate || 'null',
                where: mergedWhere
            };
            // only assign limit to query if it is defined. Allows to default to server
            // limit when limit bindable is set to falsy value
            if (this.limit) {
                query.limit = this.limit;
            }
            return query;
            var _a;
        };
        __decorate([
            aurelia_framework_1.bindable,
            __metadata("design:type", Object)
        ], AutoCompleteCustomElement.prototype, "minInput", void 0);
        __decorate([
            aurelia_framework_1.bindable,
            __metadata("design:type", Object)
        ], AutoCompleteCustomElement.prototype, "name", void 0);
        __decorate([
            aurelia_framework_1.bindable,
            __metadata("design:type", Object)
        ], AutoCompleteCustomElement.prototype, "limit", void 0);
        __decorate([
            aurelia_framework_1.bindable,
            __metadata("design:type", Object)
        ], AutoCompleteCustomElement.prototype, "debounce", void 0);
        __decorate([
            aurelia_framework_1.bindable,
            __metadata("design:type", String)
        ], AutoCompleteCustomElement.prototype, "resource", void 0);
        __decorate([
            aurelia_framework_1.bindable,
            __metadata("design:type", Array)
        ], AutoCompleteCustomElement.prototype, "items", void 0);
        __decorate([
            aurelia_framework_1.bindable({ defaultBindingMode: aurelia_framework_1.bindingMode.twoWay }),
            __metadata("design:type", Object)
        ], AutoCompleteCustomElement.prototype, "value", void 0);
        __decorate([
            aurelia_framework_1.bindable,
            __metadata("design:type", Object)
        ], AutoCompleteCustomElement.prototype, "selected", void 0);
        __decorate([
            aurelia_framework_1.bindable,
            __metadata("design:type", Object)
        ], AutoCompleteCustomElement.prototype, "attribute", void 0);
        __decorate([
            aurelia_framework_1.bindable({ defaultBindingMode: aurelia_framework_1.bindingMode.twoWay }),
            __metadata("design:type", Object)
        ], AutoCompleteCustomElement.prototype, "result", void 0);
        __decorate([
            aurelia_framework_1.bindable({ defaultBindingMode: aurelia_framework_1.bindingMode.twoWay }),
            __metadata("design:type", Array)
        ], AutoCompleteCustomElement.prototype, "results", void 0);
        __decorate([
            aurelia_framework_1.bindable,
            __metadata("design:type", Object)
        ], AutoCompleteCustomElement.prototype, "populate", void 0);
        __decorate([
            aurelia_framework_1.bindable,
            __metadata("design:type", Object)
        ], AutoCompleteCustomElement.prototype, "footerLabel", void 0);
        __decorate([
            aurelia_framework_1.bindable,
            __metadata("design:type", Function)
        ], AutoCompleteCustomElement.prototype, "footerSelected", void 0);
        __decorate([
            aurelia_framework_1.bindable,
            __metadata("design:type", Object)
        ], AutoCompleteCustomElement.prototype, "footerVisibility", void 0);
        __decorate([
            aurelia_framework_1.bindable,
            __metadata("design:type", Object)
        ], AutoCompleteCustomElement.prototype, "label", void 0);
        __decorate([
            aurelia_framework_1.bindable,
            __metadata("design:type", Object)
        ], AutoCompleteCustomElement.prototype, "endpoint", void 0);
        __decorate([
            aurelia_framework_1.bindable,
            __metadata("design:type", Object)
        ], AutoCompleteCustomElement.prototype, "placeholder", void 0);
        __decorate([
            aurelia_framework_1.bindable,
            __metadata("design:type", Object)
        ], AutoCompleteCustomElement.prototype, "sort", void 0);
        __decorate([
            aurelia_framework_1.bindable,
            __metadata("design:type", Object)
        ], AutoCompleteCustomElement.prototype, "criteria", void 0);
        __decorate([
            aurelia_framework_1.computedFrom('results', 'value'),
            __metadata("design:type", Object),
            __metadata("design:paramtypes", [])
        ], AutoCompleteCustomElement.prototype, "showFooter", null);
        __decorate([
            aurelia_framework_1.computedFrom('value'),
            __metadata("design:type", Object),
            __metadata("design:paramtypes", [])
        ], AutoCompleteCustomElement.prototype, "regex", null);
        AutoCompleteCustomElement = __decorate([
            aurelia_view_manager_1.resolvedView('spoonx/auto-complete', 'autocomplete'),
            aurelia_framework_1.inject(aurelia_api_1.Config, aurelia_pal_1.DOM.Element),
            __metadata("design:paramtypes", [typeof (_a = typeof aurelia_api_1.Config !== "undefined" && aurelia_api_1.Config) === "function" && _a || Object, Element])
        ], AutoCompleteCustomElement);
        return AutoCompleteCustomElement;
        var _a;
    }());
    exports.AutoCompleteCustomElement = AutoCompleteCustomElement;
});
