/* jshint node: true */

describe('rxFloatingHeader', function () {
    var scope, compile, rootScope, el;
    var validTemplate = '<table rx-floating-header>' +
        '<thead><tr><th>Col 1</th><th>Col 2</th></thead>' +
        '<tbody><tr><td>Hi</td><td>There</td></tr></tbody>' +
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


describe('rxJq', function () {
    var rxjq;

    var windowMock = {
        getComputedStyle: sinon.stub()
            .returns({ width: '10px', height: '20px' })
    };

    beforeEach(function () {
        module('encore.ui.rxFloatingHeader');

        module(function ($provide) {
            $provide.value('$window', windowMock);
        });

        inject(function (rxJq) {
            rxjq = rxJq;
        });
    });

    it('should accept raw DOM objects', function () {
        var div = angular.element('<div></div>'),
            raw = div[0];

        rxjq.width(raw);
        expect(windowMock.getComputedStyle).to.have.been.calledWith(raw);
    });

    it('should accept jquery lite objects and convert them to raw DOM', function () {
        var div = angular.element('<div></div>'),
            raw = div[0];

        rxjq.width(div);
        expect(windowMock.getComputedStyle).to.have.been.calledWith(raw);
        
    });
    
});
