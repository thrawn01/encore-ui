var rxTags = require('./rxTags.page').rxTags;

/**
   rxTags exercises.
   @exports encore.exercise.rxTags
   @param {Object} [options=] - Test options. Used to build valid tests.
   @param {rxTags} [options.instance=] - Component to Exercise.
   @param {string} options.sampleText - A tag that can be added.
   @example
   ```js
   describe('default exercises', encore.exercise.rxTags({
       instance: encore.rxTags.initialize('.demo rx-tags') // select one of many widgets on page
   }));
   ```
 */
exports.rxTags = function (options) {
    if (options === undefined) {
        options = {};
    }

    options = _.defaults(options, {
        sampleText: undefined
    });

    return function () {
        var component, tag, numTags;

        before(function () {
            if (options.instance !== undefined) {
                component = options.instance;
            } else {
                component = rxTags.main;
            }
            component.count().then(function (num) {
                numTags = num;
            });
        });

        if (!_.isUndefined(options.sampleText)) {
            it('adds a tag', function () {
                tag = component.addTag(options.sampleText);
                expect(tag.text).to.eventually.equal(options.sampleText);
                expect(component.count()).to.eventually.equal(numTags + 1);
            });

            it('removes a tag by clicking the x', function () {
                tag.remove();
                expect(tag.exists()).to.eventually.be.false;
                expect(component.count()).to.eventually.equal(numTags);
            });

            it('focuses the last tag by typing backspace', function () {
                tag = component.addTag(options.sampleText);
                expect(tag.isFocused()).to.eventually.be.false;
                component.sendBackspace();
                expect(tag.isFocused()).to.eventually.be.true;
            });

            it('removes a focused tag by entering a backspace', function () {
                tag.sendBackspace();
                expect(component.byText(options.sampleText).exists()).to.eventually.be.false;
                expect(component.count()).to.eventually.equal(numTags);
            });
        }

    };
};
