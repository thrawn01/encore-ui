/* jshint node: true */
describe('Directive: Active URL (inside Product Resources)', function () {
    var scope, location, compile, rootScope;
    var validTemplate = '<rx-active-url url="/servers"></rx-active-url>';

    beforeEach(function () {
        // load module
        module('encore.ui.rxActiveUrl');

        // load templates
        module('templates/rxActiveUrl.html');

        // Inject in angular constructs
        inject(function ($location, $rootScope, $compile) {
            location = $location;
            rootScope = $rootScope;
            scope = $rootScope.$new();
            compile = $compile;
        });
    });

    it('should check if location matches the pattern', function () {
        location.path('/servers');
        var el = helpers.createDirective(validTemplate, compile, scope);
        var elScope = el.isolateScope();

        expect(elScope.isNavActive('/servers')).to.be.true;
    });

    it('should return false if isNavActive does not match pattern', function () {
        location.path('/servers');
        var el = helpers.createDirective(validTemplate, compile, scope);
        var elScope = el.isolateScope();

        expect(elScope.isNavActive('/volumes')).to.be.false;
    });

    it('should have class active if URL matches location', function () {
        location.path('/servers');
        var el = helpers.createDirective(validTemplate, compile, scope);
        expect(el.children(0).hasClass('selected')).to.be.true;
    });

    it('should not have class active if URL does not match location', function () {
        location.path('/volumes');
        var el = helpers.createDirective(validTemplate, compile, scope);

        expect(el.children(0).hasClass('selected')).to.be.false;
    });

});
