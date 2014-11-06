var rxFloatingHeaderPage = require('../rxFloatingHeader.page.js').rxFloatingHeader;
var expect = require('chai').use(require('chai-as-promised')).expect;

describe('rxFloatingHeader', function () {
    var rxFloatingHeader;

    before(function () {
        demoPage.go('#/component/rxFloatingHeader');
        rxFloatingHeader = rxFloatingHeaderPage.initialize($('#rxFloatingHeader'));
    });

    it('should show element', function () {
        expect(rxFloatingHeader.isDisplayed()).to.eventually.be.true;
    });
});
