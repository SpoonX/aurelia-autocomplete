import { Config, Rest } from "aurelia-api";
export declare class AutoCompleteCustomElement {
    apiEndpoint: Rest | Config;
    element: Element;
    lastFindPromise: any;
    justSelected: boolean;
    previousValue: string | null;
    initial: boolean;
    hasFocus: boolean;
    minInput: number;
    name: string;
    limit: number;
    debounce: number;
    resource: string;
    items: any[];
    value: string;
    selected: any;
    attribute: string;
    result: null;
    results: any[];
    populate: null;
    footerLabel: string;
    footerSelected: Function;
    footerVisibility: string;
    label: (result: any) => any;
    endpoint: any;
    placeholder: string;
    sort: (items: any[]) => any[];
    criteria: {};
    readonly showFooter: boolean | "" | 0;
    /**
     * Autocomplete constructor.
     *
     * @param {Config}  api
     * @param {Element} element
     */
    constructor(api: Config, element: Element);
    /**
     * Bind callback.
     *
     * @returns {void}
     */
    bind(): any;
    /**
     * Set focus on dropdown.
     *
     * @param {boolean} value
     * @param {Event}   [event]
     *
     * @returns {boolean}
     */
    setFocus(value: boolean, event?: Event): true | Promise<void> | undefined;
    /**
     * returns HTML that wraps matching substrings with strong tags.
     * If not a "stringable" it returns an empty string.
     *
     * @param {Object} result
     *
     * @returns {String}
     */
    labelWithMatches(result: object): string;
    /**
     * Handle keyUp events from value.
     *
     * @param {Event} event
     *
     * @returns {*}
     */
    handleKeyUp(event: KeyboardEvent): true | undefined;
    /**
     * Handle keyDown events from value.
     *
     * @param {Event} event
     *
     * @returns {*}
     */
    handleKeyDown(event: KeyboardEvent): true | void;
    /**
     * Get the next result in the list.
     *
     * @param {Object}  current    selected item
     * @param {Boolean} [reversed] when true gets the previous instead
     *
     * @returns {Object} the next of previous item
     */
    nextFoundResult(current: any, reversed: boolean): any;
    /**
     * Set the text in the input to that of the selected item and set the
     * selected item as the value. Then hide the results(dropdown)
     *
     * @param {Object} [result] when defined uses the result instead of the this.selected value
     *
     * @returns {boolean}
     */
    onSelect(result?: any): boolean;
    /**
     * when search string changes perform a request, assign it to results
     * and select the first result by default.
     *
     * @returns {Promise}
     */
    valueChanged(): Promise<void> | undefined;
    /**
     * returns a list of length that is smaller or equal to the limit. The
     * default predicate is based on the regex
     *
     * @param {Object[]} items
     *
     * @returns {Object[]}
     */
    filter(items: any[]): any[];
    /**
     * returns true when the finding of matching results should continue
     *
     * @param {*} item
     *
     * @return {Boolean}
     */
    itemMatches(item: any): boolean;
    readonly regex: RegExp;
    /**
     * returns true when a request will be performed on a search change
     *
     * @returns {Boolean}
     */
    shouldPerformRequest(): boolean;
    /**
     * Returns whether or not value has enough characters (meets minInput).
     *
     * @returns {boolean}
     */
    hasEnoughCharacters(): boolean;
    /**
     * @param {Object} query a waterline query object
     *
     * @returns {Promise} which resolves to the found results
     */
    findResults(query: any): any;
    /**
     * Emit custom event, or call function depending on supplied value.
     *
     * @param {string} value
     */
    onFooterSelected(value: string): void;
    /**
     * Takes a string and converts to to a waterline query object that is used to
     * perform a forgiving search.
     *
     * @param {String} string the string to search with
     *
     * @returns {Object} a waterline query object
     */
    searchQuery(string: string): Partial<{
        populate: string;
        where: {
            or: any[];
        } | {
            [x: string]: {
                contains: string;
            };
        };
        limit: number;
    }>;
}
