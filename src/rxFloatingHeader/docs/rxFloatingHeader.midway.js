var rxFloatingHeaderPage = require('../rxFloatingHeader.page.js').rxFloatingHeader;
var ptor = protractor.getInstance();
var expect = require('chai').use(require('chai-as-promised')).expect;

describe('rxFloatingHeader', function () {
    var table, tr, middleRow, middleRowY, initialY;

    var scrollToY = function (y) {
        var command = 'window.scrollTo(0, ' + y.toString() + ');';
        return ptor.executeScript(command);
    };

    describe('One header row table', function () {
        before(function () {
            demoPage.go('#/component/rxFloatingHeader');
            table = rxFloatingHeaderPage.initialize($('table[rx-floating-area].no-filter'));
            tr = table.rootElement.$('thead tr');
            middleRow = table.rootElement.$('.middle-row');
            middleRow.getLocation().then(function (loc) {
                middleRowY = loc.y;
            });
            tr.getLocation().then(function (loc) {
                initialY = loc.y;
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

        it('should put the header back when scrolling to the top', function () {
            scrollToY(0).then(function () {
                tr.getLocation().then(function (loc) {
                    expect(loc.y).to.equal(initialY);
                });
            });
        });
    });

    describe('Multi header row table', function () {
        var filterHeader, titlesHeader, initialFilterY, filterHeight;
        before(function () {
            demoPage.go('#/component/rxFloatingHeader');
            table = rxFloatingHeaderPage.initialize($('table[rx-floating-area].filter'));
            var trs = table.rootElement.$$('thead tr');
            filterHeader = trs.get(0);
            titlesHeader = trs.get(1);
            middleRow = table.rootElement.$('.middle-row');
            middleRow.getLocation().then(function (loc) {
                middleRowY = loc.y;
            });
            filterHeader.getLocation().then(function (loc) {
                initialFilterY = loc.y;
            });
            filterHeader.getSize().then(function (size) {
                filterHeight = size.height;
            });
            
        });
        
        it('should float header after scrolling to middle of table', function () {
            scrollToY(middleRowY).then(function () {
                filterHeader.getLocation().then(function (loc) {
                    expect(loc.y).to.equal(middleRowY);
                });
                titlesHeader.getLocation().then(function (loc) {
                    expect(loc.y).to.equal(middleRowY + filterHeight);
                });
            });
        });

        it('should put the header back when scrolling to the top', function () {
            scrollToY(0).then(function () {
                filterHeader.getLocation().then(function (loc) {
                    expect(loc.y).to.equal(initialFilterY);
                });
                titlesHeader.getLocation().then(function (loc) {
                    expect(loc.y).to.equal(initialFilterY + filterHeight);
                });
            });
        });
        
    });

});
