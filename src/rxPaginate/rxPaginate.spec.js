/* jshint node: true */

describe('Pagination', function () {
    var originalItems = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],
        mockPageTracking = {
            itemsPerPage: 3,
            pageNumber: 0,
            totalPages: Math.ceil(originalItems.length / 3),
            total: originalItems.length,
            pagesToShow: 6,
            showAll: false,
            pageInit: false
        },
        pageTracking,
        items;

    beforeEach(function () {
        items = originalItems.slice(0);
    });

    describe('Directive: rxPaginate', function () {
        // TODO redo these tests to use class names for finding first, prev, next, last, etc items

        var el, items, scope, compile,
            validTemplate = '<rx-paginate page-tracking="pager"></rx-paginate>';

        beforeEach(function () {
            // Load the directive's module
            module('encore.ui.rxPaginate');
            module('templates/rxPaginate.html');
            module('encore.ui.rxMisc');

            // Inject in angular constructs
            inject(function ($rootScope, $compile, PageTracking) {
                scope = $rootScope.$new();
                pageTracking = PageTracking;
                scope.pager = PageTracking.createInstance(angular.copy(mockPageTracking));
                compile = $compile;
            });

            el = $(helpers.createDirective(angular.element(validTemplate), compile, scope));

            items = el.find('li');
        });

        afterEach(function () {
            // zero out link element
            el = null;
            items = null;
        });

        it('should link to "first" link non-first page', function () {
            var item = items.filter('.pagination-first');
            var link = item.find('a').eq(0);
            var span = item.find('span').eq(0);

            scope.pager.goToPage(3);

            scope.$digest();

            expect(item.hasClass('disabled'), 'disabled').to.be.false;
            expect(link.hasClass('ng-hide'), 'link ng-hide').to.be.false;
            expect(span.hasClass('ng-hide'), 'span ng-hide').to.be.true;

            // clicking link should move to first page
            helpers.clickElement(link[0]);

            expect(scope.pager.isFirstPage()).to.be.true;
        });

        it('should disable "first" link on first page', function () {
            var item = items.filter('.pagination-first');
            var link = item.find('a').eq(0);
            var span = item.find('span').eq(0);

            expect(item.hasClass('disabled')).to.be.true;
            expect(link.hasClass('ng-hide')).to.be.true;
            expect(span.hasClass('ng-hide')).to.be.false;
        });

        it('should link to "prev" link when previous page available', function () {
            var item = items.filter('.pagination-prev');
            var link = item.find('a').eq(0);
            var span = item.find('span').eq(0);

            scope.pager.goToPage(3);

            scope.$digest();

            expect(item.hasClass('disabled')).to.be.false;
            expect(link.hasClass('ng-hide')).to.be.false;
            expect(span.hasClass('ng-hide')).to.be.true;

            // clicking link should move to first page
            helpers.clickElement(link[0]);

            expect(scope.pager.isPage(2)).to.be.true;
        });

        it('should disable "prev" link on first page', function () {
            var item = items.filter('.pagination-prev');
            var link = item.find('a').eq(0);
            var span = item.find('span').eq(0);

            expect(item.hasClass('disabled'), 'disabled').to.be.true;
            expect(link.hasClass('ng-hide'), 'link ng-hide').to.be.true;
            expect(span.hasClass('ng-hide'), 'span ng-hide').to.be.false;
        });

        it('should link to individual page numbers', function () {
            var item = items.filter('.pagination-page').eq(0);
            var link = item.find('a').eq(0);

            expect(item.hasClass('pagination-page'), 'should be on pagination-page link').to.be.true;
            expect(item.hasClass('active'), 'link should be active').to.be.true;

            expect(link.text()).to.equal('1');

            // now try with second page link
            item = items.filter('.pagination-page').eq(1);
            link = item.find('a').eq(0);

            expect(item.hasClass('pagination-page'), 'should be on pagination-page link').to.be.true;
            expect(item.hasClass('active'), 'link should be inactive').to.be.false;

            expect(link.text()).to.equal('2');

            // clicking link should move to first page
            helpers.clickElement(link[0]);

            scope.$digest();

            expect(scope.pager.isPage(1)).to.be.true;
            expect(item.hasClass('active'), 'link should be active').to.be.true;
        });

        it('should have # of page numbers as configured', function () {
            var pagesShowing = el[0].getElementsByClassName('pagination-page');
            expect(pagesShowing).to.have.length(scope.pager.pagesToShow);
        });

        it('should link to "next" link when next page available', function () {
            var item = items.filter('.pagination-next');
            var link = item.find('a').eq(0);
            var span = item.find('span').eq(0);

            expect(item.hasClass('disabled'), 'disabled').to.be.false;
            expect(link.hasClass('ng-hide'), 'link ng-hide').to.be.false;
            expect(span.hasClass('ng-hide'), 'span ng-hide').to.be.true;

            // clicking link should move to first page
            helpers.clickElement(link[0]);

            expect(scope.pager.isPage(1)).to.be.true;
        });

        it('should disable "next" link on last page', function () {
            scope.pager.goToLastPage();

            scope.$digest();

            var item = items.filter('.pagination-next');
            var link = item.find('a').eq(0);
            var span = item.find('span').eq(0);

            expect(item.hasClass('disabled')).to.be.true;
            expect(link.hasClass('ng-hide')).to.be.true;
            expect(span.hasClass('ng-hide')).to.be.false;
        });

        it('should link to "last" link non-last page', function () {
            var item = items.filter('.pagination-last');
            var link = item.find('a').eq(0);
            var span = item.find('span').eq(0);

            // make sure we're on the "last" item
            expect(item.hasClass('pagination-last'));

            expect(item.hasClass('disabled'), 'item is disabled').to.be.false;
            expect(link.hasClass('ng-hide'), 'link is disabled').to.be.false;
            expect(span.hasClass('ng-hide'), 'span is not disabled').to.be.true;

            // clicking link should move to last page
            helpers.clickElement(link[0]);

            expect(scope.pager.isLastPage()).to.be.true;
        });

        it('should disable "last" link on last page', function () {
            scope.pager.goToLastPage();

            scope.$digest();

            var item = items.filter('.pagination-last');
            var link = item.find('a').eq(0);
            var span = item.find('span').eq(0);

            expect(item.hasClass('disabled')).to.be.true;
            expect(link.hasClass('ng-hide')).to.be.true;
            expect(span.hasClass('ng-hide')).to.be.false;
        });

        it('should disable the selected itemsPerPage button', function () {
            var buttons = items.find('.pagination-per-page-button');

            var firstButton = buttons.eq(0);
            var secondButton = buttons.eq(1);

            expect(firstButton.prop('disabled'), 'first button disabled').to.be.true;
            expect(secondButton.prop('disabled'), 'second button disabled').to.be.false;

            // clicking link should move to first page
            helpers.clickElement(secondButton[0]);
            expect(firstButton.prop('disabled'), 'first button disabled').to.be.false;
            expect(secondButton.prop('disabled'), 'second button disabled').to.be.true;

        });

        it('should update the global itemsPerPage when a user selects an itemsPerPage', function () {
            var buttons = items.find('.pagination-per-page-button');

            var firstButton = buttons.eq(0);
            var thirdButton = buttons.eq(2);
            helpers.clickElement(firstButton[0]);
            expect(firstButton.prop('disabled'), 'first button disabled').to.be.true;
            expect(thirdButton.prop('disabled'), 'second button not disabled').to.be.false;

            var thirdButtonValue = _.parseInt(thirdButton.text());

            helpers.clickElement(thirdButton[0]);

            var newPagination = pageTracking.createInstance();

            expect(newPagination.itemsPerPage).to.equal(thirdButtonValue);
                 
        });
    });

    describe('Filter: Page', function () {
        var page;

        beforeEach(function () {
            module('encore.ui.rxPaginate');

            inject(function ($filter) {
                page = $filter('Page');
            });
        });

        it('should return an array of pages to be displayed by', function () {
            // Test only one page
            expect(page({ pageNumber: 1, totalPages: 1 })).to.eql([0]);

            // Test first page when below pagesToShow limit
            expect(page({ pageNumber: 1, totalPages: 3 })).to.eql([0, 1, 2]);

            // Test last page of when below pagesToShow limit
            expect(page({ pageNumber: 3, totalPages: 3 })).to.eql([0, 1, 2]);

            // Test first page when above pagesToShow limit
            expect(page({ pageNumber: 1, totalPages: 20 })).to.eql([0, 1, 2, 3, 4]);

            // Test last page of when above pagesToShow limit
            expect(page({ pageNumber: 10, totalPages: 10 })).to.eql([5,6,7,8,9]);

            // Test a page that's deep within a total number of pages
            expect(page({ pageNumber: 15, totalPages: 102 })).to.eql([13,14,15,16,17]);
        });

        it('should allow for custom number of pages to show', function () {
            // Test a page that has odd # of custom pagesToShow
            expect(page({ pageNumber: 15, totalPages: 102, pagesToShow: 3 })).to.eql([14,15,16]);

            // Test first page that has even # of custom pagesToShow and is below pagesToShowLimit
            expect(page({ pageNumber: 1, totalPages: 4, pagesToShow: 4 })).to.eql([0,1,2,3]);

            // Test middle page that has even # of custom pagesToShow and is below pagesToShowLimit
            expect(page({ pageNumber: 2, totalPages: 4, pagesToShow: 4 })).to.eql([0,1,2,3]);

            // Test last page that has even # of custom pagesToShow and is below pagesToShowLimit
            expect(page({ pageNumber: 4, totalPages: 4, pagesToShow: 4 })).to.eql([0,1,2,3]);

            // Test first page that has even # of custom pagesToShow and is above pagesToShowLimit
            expect(page({ pageNumber: 1, totalPages: 102, pagesToShow: 4 })).to.eql([0,1,2,3]);

            // Test middle page that has even # of custom pagesToShow and is above pagesToShowLimit
            expect(page({ pageNumber: 15, totalPages: 102, pagesToShow: 4 })).to.eql([14,15,16,17]);

            // Test last page that has even # of custom pagesToShow and is above pagesToShowLimit
            expect(page({ pageNumber: 102, totalPages: 102, pagesToShow: 4 })).to.eql([98,99,100,101]);
        });
    });

    describe('Filter: Paginate', function () {
        var paginate, pager;

        beforeEach(function () {
            module('encore.ui.rxPaginate');

            inject(function ($filter, PageTracking) {
                paginate = $filter('Paginate');
                pager = PageTracking.createInstance(angular.copy(mockPageTracking));
            });
        });

        it('should return subset of items based on current page', function () {
            // expect first three pages to be returned from pagination
            expect(paginate(items, pager)).to.eql([0,1,2]);

            // change page and re-paginate
            pager.pageNumber = 2;
            expect(paginate(items, pager)).to.eql([6,7,8]);

            // last page should return remaining items
            pager.pageNumber = pager.totalPages - 1;
            expect(paginate(items, pager)).to.eql([15,16]);
        });

        it('should switch page if item deletion causes us to be past last page', function () {
            // Go to last page
            pager.goToLastPage();
            var lastPageNumber = pager.pageNumber;
            expect(paginate(items, pager), 'two items on last page').to.eql([15,16]);

            // Remove the two items on this page, should take us to pageNumber - 1
            items.pop();
            items.pop();
            expect(paginate(items, pager), 'after deleting two items').to.eql([12, 13, 14]);
            expect(pager.pageNumber, 'back one page').to.equal(lastPageNumber - 1);
        });

        it('should correctly switch if two pages worth of items are deleted', function () {
            // Go to last page
            pager.pageNumber = pager.totalPages - 1;
            var lastPageNumber = pager.pageNumber;
            expect(paginate(items, pager), 'two items on last page').to.eql([15,16]);

            // Remove the last five items, which should remove two pages
            items = items.slice(0, -5);
            expect(paginate(items, pager), 'after deleting five items').to.eql([9, 10, 11]);
            expect(pager.pageNumber, 'back two pages').to.equal(lastPageNumber - 2);
        });

        it('should set pageNumber to 0 if the items list is empty', function () {
            expect(paginate([], pager), 'no items from pager').to.eql([]);
            expect(pager.pageNumber).to.equal(0);
        });
    });
    
    describe('Filter: PaginatedItemsSummary', function () {
        var summary;

        beforeEach(function () {
            module('encore.ui.rxPaginate');

            inject(function ($filter) {
                summary = $filter('PaginatedItemsSummary');
            });
        });

        it('should show first-last if number of items is less than itemsPerPage', function () {
            var pager = {
                showAll: false,
                itemsPerPage: 10,
                total: 100,
                first: 1,
                last: 10
            };

            expect(summary(pager)).to.equal('1-10 of 100');
        });
        
        it('should show the total number of items when itemsPerPage > total', function () {
            var pager = {
                showAll: false,
                itemsPerPage: 50,
                total: 10,
                first: 1,
                last: 10
            };

            expect(summary(pager)).to.equal('10');
        });
        
        it('should show the total number of items when showAll is true', function () {
            var pager = {
                showAll: true,
                itemsPerPage: 1,
                total: 10,
                first: 1,
                last: 10
            };

            expect(summary(pager)).to.equal('10');
        });
    });

    describe('Factory: PageTracking', function () {
        var tracking;
        var LocalStorage;

        beforeEach(function () {
            module('encore.ui.rxPaginate');
            inject(function (PageTracking, _LocalStorage_) {
                tracking = PageTracking;
                LocalStorage = _LocalStorage_;
                LocalStorage.clear();
            });
        });

        afterEach(function () {
            LocalStorage.clear();
        });

        it('Should override default showAll when set', function () {
            expect(tracking.createInstance().showAll).to.be.false;
            expect(tracking.createInstance({ showAll: true }).showAll).to.be.true;
            expect(tracking.createInstance({ showAll: false }).showAll).to.be.false;
        });

        it('Should override default itemsPerPage', function () {
            expect(tracking.createInstance().itemsPerPage).to.be.eq(200);
            expect(tracking.createInstance({ itemsPerPage: 15 }).itemsPerPage).to.be.eq(15);
            expect(tracking.createInstance({ itemsPerPage: 55 }).itemsPerPage).to.be.eq(55);
        });

        it('should add itemsPerPage to the itemSizeList if it is not present', function () {
            expect(tracking.createInstance().itemSizeList).to.not.contain(45);
            expect(tracking.createInstance({ itemsPerPage: 45 }).itemSizeList).to.contain(45);
        });

        it('should allow for global stickiness of the user selected itemsPerPage', function () {
            var firstTable = tracking.createInstance();
            expect(firstTable.itemsPerPage, 'default check').to.be.eq(200);
            tracking.userSelectedItemsPerPage(50);

            var secondTable = tracking.createInstance();
            expect(secondTable.itemsPerPage, 'checking second table').to.be.eq(50);

            tracking.userSelectedItemsPerPage(500);
            var thirdTable = tracking.createInstance();
            expect(thirdTable.itemsPerPage, 'checking third table').to.be.eq(500);
        });

        it('should ignore the user selected itemsPerPage if it is not in itemSizeList', function () {
            var firstTable = tracking.createInstance({ itemsPerPage: 73 });
            expect(firstTable.itemsPerPage, 'default check').to.be.eq(73);

            // switch to 200 and then immediately back to 73
            tracking.userSelectedItemsPerPage(200);
            tracking.userSelectedItemsPerPage(73);

            // 73 isn't an option in this new pagination, so it should go back
            // to the default value of 200
            expect(tracking.createInstance().itemsPerPage, 'new pagination instance').to.equal(200);
            
        });

        it('should prefer the specified itemsPerPage over the globally configured one', function () {
            tracking.userSelectedItemsPerPage(50);

            var table = tracking.createInstance({ itemsPerPage: 350 });
            expect(table.itemsPerPage, 'options check').to.be.eq(350);
        });
    });
});
