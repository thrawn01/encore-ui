/* jshint node: true */
describe('rxFormItem', function () {
    var el, scope, compile, rootScope,
        formInput = '<input type="text">',
        formItemTemplate = '<rx-form-item label="Name"><%= input %></rx-form-item>';

    var createDirective = function (inputTemplate) {
        var html = _.template(formItemTemplate, {
            input: inputTemplate
        });

        return helpers.createDirective(html, compile, scope);
    };

    beforeEach(function () {
        module('encore.ui.rxForm');
        module('templates/rxFormItem.html');

        inject(function ($rootScope, $compile) {
            rootScope = $rootScope;
            scope = $rootScope.$new();
            compile = $compile;
        });

        el = createDirective(formInput);
    });

    afterEach(function () {
        el = null;
    });

    it('should render template correctly', function () {
        expect(el).not.be.empty;
        expect(el.find('input')).not.be.empty;
        expect(el.find('label').text()).to.contain('Name');
    });

    it('should not put text-area-label class on the element', function () {
        expect(el.find('div').hasClass('text-area-label')).to.be.false;
    });

    it('should link label to form input using unique id', function () {
        var uniqueId = el.find('label').eq(0).attr('for');

        expect(uniqueId).to.have.length.above(0);
        expect(el.find('input').eq(0).attr('id')).to.equal(uniqueId);
    });

    it('should gracefully fail if no input added', function () {
        el = createDirective('Some non-input text');

        var uniqueId = el.find('label').eq(0).attr('for');

        expect(uniqueId).to.be.undefined;
    });

    it('should link label to form input using field id', function () {
        el = createDirective('<input id="myId">');

        var uniqueId = el.find('label').eq(0).attr('for');

        expect(uniqueId).to.equal('myId');
    });

    it('should link to label to select box', function () {
        el = createDirective('<select id="myId"></select>');

        var uniqueId = el.find('label').eq(0).attr('for');

        expect(uniqueId).to.equal('myId');
    });

    it('should link to first input if multiple found', function () {
        el = createDirective('<select></select><input id="myId">');

        var uniqueId = el.find('label').eq(0).attr('for');
        var selectId = el.find('select').eq(0).attr('id');

        expect(uniqueId).to.not.equal('myId');
        expect(uniqueId).to.equal(selectId);
    });

    describe('textarea special case', function () {
        var oldFormInput;

        beforeEach(function () {
            oldFormInput = formInput;
            formInput = '<textarea>';
            el = createDirective(formInput);
        });

        afterEach(function () {
            formInput = oldFormInput;
        });
        it('should put text-area-label class on the main div', function () {
            expect(el.find('div').hasClass('text-area-label')).to.be.true;
        });
    });
});

describe('rxFormOptionTable (Checkbox)', function () {
    var scope, compile, rootScope;

    var checkboxFormTemplate =
        '<rx-form-option-table data="tableData" required="true" columns="tableColumns" ' +
        'type="checkbox" model="myModel"></rx-form-option-table>';

    var tableDataTemplate = [
        {
            'name': 'Item 1'
        },
        {
            'name': 'Item 2'
        }
    ];

    beforeEach(function () {
        module('encore.ui.rxForm');
        module('templates/rxFormOptionTable.html');

        inject(function ($rootScope, $compile) {
            rootScope = $rootScope;
            scope = $rootScope.$new();
            compile = $compile;
        });
    });

    it('should validate if there is an empty form but no required flag', function () {
        var checkboxFormTemplate2 =
            '<rx-form-option-table data="tableData" columns="tableColumns" ' +
            'type="checkbox" model="myModel"></rx-form-option-table>';

        var checkScope = rootScope.$new();
        checkScope.tableData = _.clone(tableDataTemplate);
        checkScope.myModel = [true, false];

        var checkTable = helpers.createDirective(checkboxFormTemplate2, compile, checkScope);
        var checkTableScope = checkTable.isolateScope();
        expect(checkTableScope.checkRequired()).to.be.false;
    });

    it('should invalidate if there is an empty form and a required flag', function () {
        var checkScope = rootScope.$new();
        checkScope.tableData = _.clone(tableDataTemplate);
        checkScope.myModel = [false, false];

        var checkTable = helpers.createDirective(checkboxFormTemplate, compile, checkScope);
        var checkTableScope = checkTable.isolateScope();
        expect(checkTableScope.checkRequired()).to.be.true;
    });

    it('should validate if there is one checkbox and a required flag', function () {
        var checkScope = rootScope.$new();
        checkScope.tableData = _.clone(tableDataTemplate);
        checkScope.myModel = [true, false];

        var checkTable = helpers.createDirective(checkboxFormTemplate, compile, checkScope);
        var checkTableScope = checkTable.isolateScope();
        expect(checkTableScope.checkRequired()).to.be.false;
    });

    it('should validate if there is one checkbox with a ngTrueValue and a required flag', function () {
        var checkScope = rootScope.$new();
        checkScope.tableData = [
            {
                'name': 'Item 1'
            },
            {
                'name': 'Item 2',
                'value': 'checked',
                'falseValue': 'unchecked'
            }
        ];
        checkScope.myModel = [false, 'checked'];

        var checkTable = helpers.createDirective(checkboxFormTemplate, compile, checkScope);
        var checkTableScope = checkTable.isolateScope();
        expect(checkTableScope.checkRequired()).to.be.false;
    });
    
    it('should validate if there is one checkbox without an ngTrueValue a required flag', function () {
        var checkScope = rootScope.$new();
        checkScope.tableData = [
            {
                'name': 'Item 1'
            },
            {
                'name': 'Item 2',
                'value': 'checked',
                'falseValue': 'unchecked'
            }
        ];
        checkScope.myModel = [true, 'unchecked'];

        var checkTable = helpers.createDirective(checkboxFormTemplate, compile, checkScope);
        var checkTableScope = checkTable.isolateScope();
        expect(checkTableScope.checkRequired()).to.be.false;
    });

    it('should invalidate if there is a form with falsey values and a required flag', function () {
        var checkScope = rootScope.$new();
        checkScope.tableData = [
            {
                'name': 'Item 1'
            },
            {
                'name': 'Item 2',
                'value': 'checked',
                'falseValue': 'unchecked'
            }
        ];

        checkScope.myModel = [false, 'unchecked'];
        var checkTable = helpers.createDirective(checkboxFormTemplate, compile, checkScope);
        var checkTableScope = checkTable.isolateScope();
        expect(checkTableScope.checkRequired()).to.be.true;
    });
});

describe('rxFormOptionTable (Radio)', function () {
    var el, scope, compile, rootScope, elScope,
        radioFormTemplate =
            '<rx-form-option-table data="tableData" columns="tableColumns" ' +
            'type="radio" model="myModel" field-id="optionTable" selected="0"></rx-form-option-table>';

    beforeEach(function () {
        module('encore.ui.rxForm');
        module('templates/rxFormOptionTable.html');

        inject(function ($rootScope, $compile) {
            rootScope = $rootScope;
            scope = $rootScope.$new();
            compile = $compile;
        });

        // init myModel
        scope.myModel;

        scope.tableData = [
            {
                'name': 'Option #1',
                'value': 0
            }, {
                'name': 'Option #2',
                'value': 1
            }, {
                'name': 'Option #3',
                'value': 2
            }
        ];

        scope.tableColumns = [{
            'label': 'Name',
            'key': 'name',
            'selectedLabel': '(Already saved data)'
        }];

        el = helpers.createDirective(radioFormTemplate, compile, scope);

        elScope = el.isolateScope();
    });

    afterEach(function () {
        el = null;
        elScope = null;
    });

    it('should determine the current row', function () {
        expect(elScope.isCurrent('0'), 'Item 1').to.be.true;

        expect(elScope.isCurrent(1), 'Item 2').to.be.false;
    });

    it('should determine the selected row for radio inputs', function () {
        // nothing should be selected by default
        expect(elScope.isSelected(0), 'Item 1').to.be.false;
        expect(elScope.isSelected(1), 'Item 2').to.be.false;

        // select second item
        scope.myModel = 1;
        scope.$digest();

        expect(elScope.isSelected(0), 'Item 1 still unselected').to.be.false;
        expect(elScope.isSelected(1), 'Item 2 now selected').to.be.true;

        // should take either string or int
        expect(elScope.isSelected('1'), 'Check item 2 selected with string').to.be.true;
    });

    it('should determine the selected row for checkbox inputs', function () {
        var checkboxFormTemplate =
            '<rx-form-option-table data="tableData" columns="tableColumns" ' +
            'type="checkbox" model="myModel" field-id="optionTable2"></rx-form-option-table>';

        var checkScope = rootScope.$new();
        checkScope.myModel = [];

        var checkTable = helpers.createDirective(checkboxFormTemplate, compile, checkScope);

        var checkTableScope = checkTable.isolateScope();

        // nothing should be selected by default
        expect(checkTableScope.isSelected(0, 0), 'Item 1').to.be.false;
        expect(checkTableScope.isSelected(1, 1), 'Item 2').to.be.false;

        // select second item
        checkScope.myModel[1] = 1;
        checkScope.$digest();

        expect(checkTableScope.isSelected(0, 0), 'Item 1 still unselected').to.be.false;
        expect(checkTableScope.isSelected(1, 1), 'Item 2 now selected').to.be.true;

        // select first item
        checkScope.myModel[0] = 0;
        checkScope.$digest();

        expect(checkTableScope.isSelected(0, 0), 'Item 1 now selected').to.be.true;
        expect(checkTableScope.isSelected(1, 1), 'Item 2 still selected').to.be.true;
    });

    it('should correctly return the attribute from the passed object', function () {
        var column = { key: 'test' },
            data = { test: 'VALUE' };
        expect(elScope.getContent(column, data)).to.be.eq('VALUE');
    });

    it('should correctly interpolate expression and output nested properties from an object', function () {
        var column = { key: '{{ test.data }}' },
            data = { test: { data: 10 }};
        expect(elScope.getContent(column, data)).to.be.eq('10');
    });

    it('should correctly interpolate expression and apply the uppercase filter', function () {
        var column = { key: '{{ data | uppercase }}' },
            data = { data: 'lowercase' };
        expect(elScope.getContent(column, data)).to.be.eq('LOWERCASE');
    });

    it('should correctly interpolate expression and do the math inside it', function () {
        var column = { key: '{{ value * 10 }}' },
            data = { value: 100 };
        expect(elScope.getContent(column, data)).to.be.eq('1000');
    });

    it('should correctly interpolate expression and apply the currency filter to it', function () {
        var column = { key: '{{ amount | currency }}' },
            data = { amount: 12.5 };
        expect(elScope.getContent(column, data)).to.be.eq('$12.50');
    });
});
