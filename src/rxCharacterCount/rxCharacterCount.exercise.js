var _ = require('lodash');
var rxCharacterCount = require('./rxCharacterCount.page').rxCharacterCount;

/**
   rxCharacterCount exercises.
   @exports encore.exercise.rxCharacterCount
   @param {Object} [options=] - Test options. Used to build valid tests.
   @param {string} [options.cssSelector=] - Fallback selector string to initialize widget with.
   @param {Number} [options.maxCharacters=254] - The total number of characters allowed.
   @param {Number} [options.nearLimit=10] - The number of remaining characters needed to trigger the "near-limit" class.
   @param {Boolean} [options.ignoreInsignificantWhitespace=false] - Whether or not the textbox ignores leading and
   trailing whitespace when calculating the remaining character count.
   @example
   ```js
   describe('default exercises', encore.exercise.rxCharacterCount({
       cssSelector: '.demo-custom-max-characters', // select one of many widgets on page
       maxCharacters: 25,
       nearLimit: 12,
       ignoreInsignificantWhitespace: false
   }));
   ```
 */
exports.rxCharacterCount = function (options) {
    if (options === undefined) {
        options = {};
    }

    options = _.defaults(options, {
        maxCharacters: 254,
        nearLimit: 10,
        ignoreInsignificantWhitespace: true
    });

    return function () {
        var component;

        before(function () {
            if (options.cssSelector === undefined) {
                component = rxCharacterCount.main;
            } else {
                component = rxCharacterCount.initialize($(options.cssSelector));
            }
        });

        it('should show element', function () {
            expect(component.isDisplayed()).to.eventually.be.true;
        });

        it('should have ' + options.maxCharacters + ' remaining characters by default', function () {
            expect(component.remaining).to.eventually.equal(options.maxCharacters);
        });

        it('should update the remaining number of characters left when you insert text', function () {
            component.comment = 'Foo';
            expect(component.remaining).to.eventually.equal(options.maxCharacters - 3);
        });

        it('should erase all text and replace it with new text on update', function () {
            component.comment = 'Bar';
            expect(component.comment).to.eventually.equal('Bar');
        });

        it('should not set the near-limit class on an empty text box', function () {
            component.comment = '';
            expect(component.isNearLimit()).to.eventually.be.false;
        });

        it('should not set the over-limit class on an empty text box', function () {
            expect(component.isOverLimit()).to.eventually.be.false;
        });

        var belowNearLimitLength = options.maxCharacters + 1 - options.nearLimit;
        it('should not set the near-limit class when ' + belowNearLimitLength + ' characters are entered', function () {
            component.comment = Array(belowNearLimitLength).join('a');
            expect(component.isNearLimit()).to.eventually.be.false;
        });

        var atNearLimitLength = options.maxCharacters + 2 - options.nearLimit;
        it('should set the near-limit class when ' + atNearLimitLength + ' characters are entered', function () {
            component.comment = Array(atNearLimitLength).join('a');
            expect(component.isNearLimit()).to.eventually.be.true;
        });

        var aboveNearLimitLength = options.maxCharacters + 3 - options.nearLimit;
        it('should set the near-limit class when ' + aboveNearLimitLength + ' characters are entered', function () {
            component.comment = Array(aboveNearLimitLength).join('a');
            expect(component.isNearLimit()).to.eventually.be.true;
        });

        var atLimit = options.maxCharacters + 1;
        it('should not set the over-limit class when ' + atLimit + ' characters are entered', function () {
            component.comment = Array(atLimit).join('a');
            expect(component.isOverLimit()).to.eventually.be.false;
        });

        it('should have zero remaining characters', function () {
            expect(component.remaining).to.eventually.equal(0);
        });

        var overLimit = options.maxCharacters + 2;
        it('should set the over-limit class when ' + overLimit + ' characters are entered', function () {
            component.comment = Array(overLimit).join('a');
            expect(component.isOverLimit()).to.eventually.be.true;
        });

        it('should display a negative number when the over-limit class is reached', function () {
            expect(component.remaining).to.eventually.equal(-1);
        });

        var whitespace = '    leading and trailing whitespace    ';
        var whitespaceLength = whitespace.length;
        var trimmedLength = whitespace.trim().length;
        if (options.ignoreInsignificantWhitespace) {
            it('should ignore insignificant leading and trailing whitespace', function () {
                component.comment = whitespace;
                expect(component.remaining).to.eventually.equal(options.maxCharacters - trimmedLength);
            });
        } else {
            it('should count insignificant leading and trailing whitespace', function () {
                component.comment = whitespace;
                expect(component.remaining).to.eventually.equal(options.maxCharacters - whitespaceLength);
            });
        }

        after(function () {
            component.comment = '';
        });

    };
};
