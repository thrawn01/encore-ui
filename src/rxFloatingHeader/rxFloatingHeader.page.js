/*jshint node:true*/
var Page = require('astrolabe').Page;

var rxFloatingHeader = {

    isDisplayed: {
        value: function () {
            return this.rootElement.isDisplayed();
        }
    }

};

exports.rxFloatingHeader = {

    initialize: function (rxFloatingHeaderElement) {
        rxFloatingHeader.rootElement = {
            get: function () { return rxFloatingHeaderElement; }
        };
        return Page.create(rxFloatingHeader);
    }

};
