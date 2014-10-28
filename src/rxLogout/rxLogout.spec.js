/* jshint node: true */
describe('rxLogout', function () {
    var el, compile, scope, elScope, ngWindow, ngLocation;

    var template = '<button rx-logout="{{logoutUrl}}"></button>';

    var authMock = {
        logout: sinon.spy()
    };

    beforeEach(function () {
        module('encore.ui.rxLogout');

        // Provide any mocks needed
        module(function ($provide) {
            ngWindow = { location: '' };
            $provide.value('$window', ngWindow);

            // See https://github.com/angular/angular.js/issues/4931
            $provide.value('$document', [{}]);

            $provide.value('Auth', authMock);
        });

        // Inject in angular constructs
        inject(function ($rootScope, $compile, $location) {
            scope = $rootScope.$new();
            compile = $compile;
            ngLocation = $location;
        });

        scope.logoutUrl = '/logout';

        el = helpers.createDirective(template, compile, scope);
        elScope = el.isolateScope();
    });

    afterEach(function () {
        authMock.logout.reset();
    });

    it('should log you out', function () {
        helpers.clickElement(el);

        expect(authMock.logout).to.be.calledOnce;

        // test that location is properly set (and '#' added for non-HTML5 mode)
        expect(ngWindow.location).to.equal('#' + scope.logoutUrl);
    });

    it('should not use hashbang in HTML5 mode', function () {
        ngLocation.$$html5 = true;

        helpers.clickElement(el);

        expect(authMock.logout).to.be.calledOnce;

        // test HTML5 routing mode
        expect(ngWindow.location).to.equal(scope.logoutUrl);
    });

    it('should use default path if no URL provided', function () {
        // rebuild template w/o path
        var template = '<button rx-logout></button>';

        el = helpers.createDirective(template, compile, scope);
        elScope = el.isolateScope();

        helpers.clickElement(el);

        // test HTML5 routing mode
        expect(ngWindow.location).to.contain(elScope.logoutUrl);
    });
});
