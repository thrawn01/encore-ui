/* jshint node: true */

describe('rxFloatingHeader', function () {
    var scope, compile, rootScope, el;
    var validTemplate = '<table rx-floating-header>' +
        '<thead><tr><th>Col 1</th><th>Col 2</th></thead>' +
        '</table>';
    beforeEach(function () {
        // load module
        module('encore.ui.rxFloatingHeader');

        // load templates
        module('templates/rxFloatingHeader.html');

        // Inject in angular constructs
        inject(function ($location, $rootScope, $compile) {
            rootScope = $rootScope;
            scope = $rootScope.$new();
            compile = $compile;
        });

        el = helpers.createDirective(validTemplate, compile, scope);
    });

    it('shall not pass', function () {
        // Fail initial test to keep people honest
        expect(true).to.be.false;
    });
});
