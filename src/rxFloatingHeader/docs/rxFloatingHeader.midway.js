var rxFloatingHeaderPage = require('../rxFloatingHeader.page.js').rxFloatingHeader;
var ptor = protractor.getInstance();
var expect = require('chai').use(require('chai-as-promised')).expect;

describe('rxFloatingHeader', function () {
    var table, tr, middleRow, middleRowY;

    var scrollToY = function (y) {
        var command = 'window.scrollTo(0, ' + y.toString() + ');';
        return ptor.executeScript(command);
    };

    before(function () {
        demoPage.go('#/component/rxFloatingHeader');
        table = rxFloatingHeaderPage.initialize($('table[rx-floating-area].no-filter'));
        tr = table.rootElement.$('thead tr');
        middleRow = table.rootElement.$('.middle-row');
        middleRow.getLocation().then(function (loc) {
            middleRowY = loc.y;
        });
        
    });

    it('should show element', function () {
        expect(table.isDisplayed()).to.eventually.be.true;
    });

    it('should float header after scrolling to middle of table', function () {
        scrollToY(middleRowY).then(function () {
            tr.getLocation().then(function (loc) {
                expect(loc.y).to.equal(middleRowY);
            });
        });
    });
});
