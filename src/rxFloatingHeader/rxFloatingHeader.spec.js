/* jshint node: true */

describe('rxFloatingHeader', function () {
    var scope, compile, rootScope, el, isolateScope;
    var validTemplate =
        '<table rx-floating-header>' +
            '<thead>' +
                '<tr><th colspan="2"><input></th></tr>' +
                '<tr><th>Col 1</th><th>Col 2</th></tr>' +
            '</thead>' +
            '<tbody>' +
                '<tr><td>Hi</td><td>There 1</td></tr>' +
                '<tr><td>Hi</td><td>There 2</td></tr>' +
                '<tr><td>Hi</td><td>There 3</td></tr>' +
                '<tr><td>Hi</td><td>There 4</td></tr>' +
                '<tr><td>Hi</td><td>There 5</td></tr>' +
                '<tr><td>Hi</td><td>There 6</td></tr>' +
                '<tr><td>Hi</td><td>There 7</td></tr>' +
                '<tr><td>Hi</td><td>There 8</td></tr>' +
                '<tr class="middle-row"><td>Hi</td><td>There 9</td></tr>' +
                '<tr><td>Hi</td><td>There 10</td></tr>' +
                '<tr><td>Hi</td><td>There 11</td></tr>' +
                '<tr><td>Hi</td><td>There 12</td></tr>' +
                '<tr><td>Hi</td><td>There 13</td></tr>' +
            '</tbody>' +
        '</table>';

    var rxJq = function () {
        var height = '20px',
            width = '20px',
            shouldFloat = true;
        return {
            // mock methods
            shouldFloat: function () { return shouldFloat; },
            onscroll: function () {},
            height: function () { return height; },
            width: function () { return width; },

            // methods to control the mock
            setShouldFloat: function (val) { shouldFloat = val; },
            setHeight: function (val) { height = val; },
            setWidth: function (val) { width = val; }
        };
    };

    var mockJq = rxJq();

    beforeEach(function () {
        // load module
        module('encore.ui.rxFloatingHeader');

        // load templates
        module('templates/rxFloatingHeader.html');

        module(function ($provide) {
            $provide.value('rxJq', mockJq);
        });

        // Inject in angular constructs
        inject(function ($location, $rootScope, $compile) {
            rootScope = $rootScope;
            scope = $rootScope.$new();
            compile = $compile;
        });

        el = helpers.createDirective(validTemplate, compile, scope);
        scope.$digest();
        isolateScope = el.isolateScope();
    });

    it('should apply .filter-header and .filter-box to headers and inputs', function () {
        var ths = el.find('th');
        var inputs = el.find('input');

        // .filter-header should only be added to the <th> which has an <input>,
        // in this case the first <th>
        expect(ths, 'three th elements').to.have.length(3);
        expect(ths.eq(0).hasClass('filter-header'), 'first th').to.be.true;
        expect(ths.eq(1).hasClass('filter-header'), 'second th').to.be.false;
        expect(ths.eq(2).hasClass('filter-header'), 'third th').to.be.false;

        expect(inputs, 'one input').to.have.length(1);
        expect(inputs.eq(0).hasClass('filter-box')).to.be.true;
    });

    it('should add .rx-floating-header when we scroll past the header', function () {
        isolateScope.updateHeaders();
        expect(el.find('thead tr').hasClass('rx-floating-header')).to.be.true;
    });

    it('should remove .rx-floating-header when we scroll back up', function () {
        isolateScope.updateHeaders();
        expect(el.find('thead tr').hasClass('rx-floating-header'), 'add class').to.be.true;

        mockJq.setShouldFloat(false);
        isolateScope.updateHeaders();
        expect(el.find('thead tr').hasClass('rx-floating-header'), 'removed class').to.be.false;
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
