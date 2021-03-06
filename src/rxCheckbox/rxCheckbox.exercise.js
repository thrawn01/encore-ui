var _ = require('lodash');
var rxCheckbox = require('./rxCheckbox.page').rxCheckbox;

/**
 * @description rxCheckbox exercises
 * @exports encore.exercise.rxCheckbox
 * @param {Object} [options=] - Test options. Used to build valid tests.
 * @param {rxCheckbox} [options.instance=] - Component to exercise.
 * @param {String} [options.cssSelector=] - DEPRECATED: Fallback selector string to initialize widget with.
 * @param {Boolean} [options.disabled=false] - Determines if the checkbox is disabled
 * @param {Boolean} [options.selected=false] - Determines if the checkbox is selected
 * @param {Boolean} [options.visible=true] - Determines if the checkbox is visible
 * @param {Boolean} [options.valid=true] - Determines if the checkbox is valid
 */
exports.rxCheckbox = function (options) {
    if (options === undefined) {
        options = {};
    }

    options = _.defaults(options, {
        disabled: false,
        selected: false,
        visible: true,
        valid: true
    });

    return function () {
        var component;

        before(function () {
            if (options.instance !== undefined) {
                component = options.instance;
            }

            if (options.cssSelector !== undefined) {
                console.warn('Deprecated exercise option `cssSelector` will be removed in favor of `instance`');
                component = rxCheckbox.initialize($(options.cssSelector));
            }
        });

        it('should be present', function () {
            expect(component.isPresent()).to.eventually.be.true;
        });

        it('should be a checkbox', function () {
            expect(component.isCheckbox()).to.eventually.be.true;
        });

        it('should ' + (options.visible ? 'be' : 'not be') + ' visible', function () {
            expect(component.isDisplayed()).to.eventually.eq(options.visible);
        });

        it('should ' + (options.disabled ? 'be' : 'not be') + ' disabled', function () {
            expect(component.isDisabled()).to.eventually.eq(options.disabled);
        });

        it('should ' + (options.selected ? 'be' : 'not be') + ' selected', function () {
            expect(component.isSelected()).to.eventually.eq(options.selected);
        });

        if (options.disabled) {
            it('should not respond to selecting and unselecting', function () {
                component.isSelected().then(function (selected) {
                    selected ? component.deselect() : component.select();
                    expect(component.isSelected()).to.eventually.equal(selected);
                    // even though it "doesn't respond to selecting and unselecting"
                    // attempt to put it back anyway in case it did actually respond.
                    // that way nobody accidentally submits a swapped checkbox after
                    // running these exercises.
                    selected ? component.select() : component.deselect();
                    expect(component.isSelected()).to.eventually.equal(selected);
                });
            });
        } else {
            it('should respond to selecting and unselecting', function () {
                component.isSelected().then(function (selected) {
                    selected ? component.deselect() : component.select();
                    expect(component.isSelected()).to.eventually.not.equal(selected);
                    // exercises should never alter the state of a page.
                    // always put it back when you're done.
                    selected ? component.select() : component.deselect();
                    expect(component.isSelected()).to.eventually.equal(selected);
                });
            });
        }

        it('should ' + (options.valid ? 'be' : 'not be') + ' valid', function () {
            expect(component.isValid()).to.eventually.eq(options.valid);
        });
    };
};
