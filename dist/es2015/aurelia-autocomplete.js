import { Config as ViewManager } from 'aurelia-view-manager';
import { getLogger } from 'aurelia-logging';

import { AutoCompleteCustomElement } from './component/autocomplete';

export { AutoCompleteCustomElement } from './component/autocomplete';
export function configure(aurelia, configCallback) {
  aurelia.container.get(ViewManager).configureNamespace('spoonx/autocomplete', {
    location: './{{framework}}/{{view}}.html'
  });

  if (typeof configCallback === 'function') {
    configCallback();
  }

  aurelia.globalResources('./component/autocomplete');
}

const logger = getLogger('aurelia-autocomplete');

export { logger };