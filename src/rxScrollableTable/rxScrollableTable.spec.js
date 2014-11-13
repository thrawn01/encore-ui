/* jshint node: true */

describe('rxScrollableTable', function () {
    var scope, compile, rootScope, el;
    var validTemplate = '<rx-scrollable-table></rx-scrollable-table>';

    beforeEach(function () {
        // load module
        module('encore.ui.rxScrollableTable');

        // load templates
        module('templates/rxScrollableTable.html');

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