/*jshint node:true*/
var Page = require('astrolabe').Page;

var rxScrollableTable = {

    isDisplayed: {
        value: function () {
            return this.rootElement.isDisplayed();
        }
    }

};

exports.rxScrollableTable = {

    initialize: function (rxScrollableTableElement) {
        rxScrollableTable.rootElement = {
            get: function () { return rxScrollableTableElement; }
        };
        return Page.create(rxScrollableTable);
    }

};
