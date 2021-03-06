var rxBulkSelect = require('./rxBulkSelect.page').rxBulkSelect;
var _ = require('lodash');

/**
   rxBulkSelect exercises.
   @exports encore.exercise.rxBulkSelect
   @param {Object} [options=] - Test options. Used to build valid tests.
   @param {rxBulkSelect} [options.instance=] - Component to exercise.
   @param {string} [options.cssSelector=] - DEPRECATED: Fallback selector string to initialize widget with.
   @example
   ```js
   describe('default exercises', encore.exercise.rxBulkSelect({
       instance: myPage.bulkSelect // select one of many widgets from your page objects
   }));
   ```
 */
exports.rxBulkSelect = function (options) {
    if (options === undefined) {
        options = {};
    }

    options = _.defaults(options, {});

    return function () {
        var component;

        before(function () {
            if (options.instance !== undefined) {
                component = options.instance;
            } else {
                component = rxBulkSelect.main;
            }

            if (options.cssSelector !== undefined) {
                console.warn('Deprecated exercise option `cssSelector` will be removed in favor of `instance`');
                component = rxBulkSelect.initialize($(options.cssSelector));
            }
        });

        it('has no selected rows, a hidden message, and a disabled batch actions link', function () {
            expect(component.anySelected()).to.eventually.be.false;
            expect(component.bulkMessage).to.eventually.be.null;
            expect(component.isEnabled()).to.eventually.be.false;
        });

        it('shows the message and enables the batch actions link when a row is selected', function () {
            component.row(0).select();
            expect(component.bulkMessage).to.eventually.match(/^1 \w+ is selected.$/);
            expect(component.isEnabled()).to.eventually.be.true;
        });

        it('updates the message as rows are selected', function () {
            component.selectByIndex([1, 2]);
            expect(component.bulkMessage).to.eventually.match(/^3 \w+s are selected.$/);
        });

        it('hides the message and disables the batch actions link when all rows are deselected', function () {
            component.deselectByIndex([0, 1, 2]);
            expect(component.bulkMessage).to.eventually.be.null;
            expect(component.isEnabled()).to.eventually.be.false;
        });

        it('selects all rows via the header checkbox', function () {
            component.selectAllCheckbox.select();
            expect(component.allSelected()).to.eventually.be.true;
            expect(component.bulkMessage).to.eventually.match(/^10 \w+s are selected.$/);
            expect(component.isEnabled()).to.eventually.be.true;
        });

        it('clears the selection via the header checkbox', function () {
            component.selectAllCheckbox.deselect();
            expect(component.anySelected()).to.eventually.be.false;
            expect(component.bulkMessage).to.eventually.be.null;
            expect(component.isEnabled()).to.eventually.be.false;
        });

        it('selects all rows via the button in the message', function () {
            component.row(0).select();
            component.selectAll();
            expect(component.allSelected()).to.eventually.be.true;
            expect(component.selectAllCheckbox.isSelected()).to.eventually.be.true;
            expect(component.bulkMessage).to.eventually.match(/^10 \w+s are selected.$/);
            expect(component.isEnabled()).to.eventually.be.true;
        });

        it('clears the selection via the button in the message', function () {
            component.clearSelections();
            expect(component.anySelected()).to.eventually.be.false;
            expect(component.selectAllCheckbox.isSelected()).to.eventually.be.false;
            expect(component.bulkMessage).to.eventually.be.null;
            expect(component.isEnabled()).to.eventually.be.false;
        });

    };
};
