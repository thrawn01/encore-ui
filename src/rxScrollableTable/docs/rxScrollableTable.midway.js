var rxScrollableTablePage = require('../rxScrollableTable.page.js').rxScrollableTable;
var expect = require('chai').use(require('chai-as-promised')).expect;

describe('rxScrollableTable', function () {
    var rxScrollableTable;

    before(function () {
        demoPage.go('#/component/rxScrollableTable');
        rxScrollableTable = rxScrollableTablePage.initialize($('#rxScrollableTable'));
    });

    it('should show element', function () {
        expect(rxScrollableTable.isDisplayed()).to.eventually.be.true;
    });
});
