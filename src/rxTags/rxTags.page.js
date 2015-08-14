/*jshint node:true*/
var Page = require('astrolabe').Page;

/**
   @namespace
 */
var tag = function (tagElement) {
    return Page.create({

        exists: {
            value: function () {
                return tagElement.isPresent();
            }
        },

        isFocused: {
            value: function () {
                return browser.driver.switchTo().activeElement().getId().then(function (activeId) {
                    return tagElement.getId().then(function (tagId) {
                        return _.isEqual(activeId, tagId);
                    });
                });
            }
        },

        sendBackspace: {
            value: function () {
                tagElement.click();
                tagElement.sendKeys(protractor.Key.BACK_SPACE);
            }
        },

        text: {
            get: function () {
                return tagElement.$('.text').getText();
            }
        },

        category: {
            get: function () {
                return tagElement.$('.category').getText().then(function (text) {
                    // Strip the bounding parens
                    return text.slice(1, -1);
                });
            }
        },

        remove: {
            value: function () {
                tagElement.$('.fa-times').click();
            }
        }

    });
};

/**
   @namespace
 */
var rxTags = {

    /**
       @function
       @returns {Boolean} Whether the root element is currently displayed.
     */
    isDisplayed: {
        value: function () {
            return this.rootElement.isDisplayed();
        }
    },

    count: {
        value: function () {
            return this.rootElement.$$('.tag').count();
        }
    },

    txtNewTag: {
        get: function () {
            return this.rootElement.element(by.model('newTag'));
        }
    },

    newTag: {
        set: function (text) {
            this.txtNewTag.clear();
            this.txtNewTag.sendKeys(text, protractor.Key.ENTER);
        }
    },

    addTag: {
        value: function (text) {
            this.newTag = text;
            this.txtNewTag.clear();
            return this.byText(text);
        }
    },

    sendBackspace: {
        value: function () {
            this.txtNewTag.click();
            this.txtNewTag.sendKeys(protractor.Key.BACK_SPACE);
        }
    },

    byText: {
        value: function (text) {
            return tag(this.rootElement.element(by.cssContainingText('.tag', text)));
        }
    }

};

/**
   @exports encore.rxTags
 */
exports.rxTags = {

    /**
       @function
       @param {WebElement} rxTagsElement - WebElement to be transformed into an rxTagsElement object.
       @returns {rxTags} Page object representing the rxTags object.
     */
    initialize: function (rxTagsElement) {
        rxTags.rootElement = {
            get: function () { return rxTagsElement; }
        };
        return Page.create(rxTags);
    },

    /**
       @returns {rxTags} Page object representing the _first_ rxTags object found on the page.
    */
    main: (function () {
        rxTags.rootElement = {
            get: function () { return $('rx-tags'); }
        };
        return Page.create(rxTags);
    })()

};
