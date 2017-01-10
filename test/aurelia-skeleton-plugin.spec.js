import {configure} from '../src/aurelia-autocomplete';

describe('aurelia-skeleton-plugin', function() {
  describe('configure()', function() {
    it('Should call configure with a function', function() {
      expect(typeof configure).toBe('function');
    });
  });
});
