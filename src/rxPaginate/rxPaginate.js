angular.module('encore.ui.rxPaginate', [])
/**
 *
 * @ngdoc directive
 * @name encore.ui.rxPaginate:rxPaginate
 * @restrict E
 * @description
 * Directive that takes in the page tracking object and outputs a page
 * switching controller
 *
 * @param {Object} pageTracking This is the page tracking service instance to
 * be used for this directive
 * @param {number} numberOfPages This is the maximum number of pages that the
 * page object will display at a time.
 */
.directive('rxPaginate', function (PageTracking) {
    return {
        templateUrl: 'templates/rxPaginate.html',
        restrict: 'E',
        scope: {
            pageTracking: '=',
            numberOfPages: '@'
        },
        link: function (scope, element) {

            // We need to find the `<table>` that contains
            // this `<rx-paginate>`
            var parentElement = element.parent();
            while (parentElement.length && parentElement[0].tagName !== 'TABLE') {
                parentElement = parentElement.parent();
            }

            var table = parentElement;

            scope.updateItemsPerPage = function (itemsPerPage) {
                scope.pageTracking.itemsPerPage = itemsPerPage;
                scope.pageTracking.pageNumber = 0;

                // Set itemsPerPage as the new default value for
                // all future pagination tables
                PageTracking.userSelectedItemsPerPage(itemsPerPage);
            };

            scope.scrollToTop = function () {
                table[0].scrollIntoView(true);
            };
        }
    };
})
/**
*
* @ngdoc service
* @name encore.ui.rxPaginate:PageTracking
* @description
* This is the data service that can be used in conjunction with the pagination
* objects to store/control page display of data tables and other items.
*
* @property {number} itemsPerPage This is the current setting for the number
* of items to display per page.
* @property {number} pagesToShow This is the number of pages to show
* in the pagination controls
* @property {number} pageNumber This is where the current page number is
* stored.
* @property {boolean} pageInit This is used to determine if the page has been
* initialzed before.
* @property {number} total This is the total number of items that are in the
* data set
* @property {boolean} showAll This is used to determine whether or not to use
* the pagination or not.
*
* @method createInstance This is used to generate the instance of the
* PageTracking object. Enables the ability to override default settings.
* If you choose to override the default `itemsPerPage`, and it isn't
* a value in itemSizeList, then it will automatically be added to itemSizeList
* at the right spot.
*
* @method userSelectedItemsPerPage Call this when a user chooses a new value for
* itemsPerPage, and all future instances of PageTracking will default to that value,
* assuming that the value exists in itemSizeList
* 
*
* @example
* <pre>
* PageTracking.createInstance({showAll: true, itemsPerPage: 15});
* </pre>
*/
.factory('PageTracking', function () {

    var selectedItemsPerPage;

    function PageTrackingObject (opts) {
        this.settings = _.defaults(opts, {
            itemsPerPage: 50,
            pagesToShow: 5,
            pageNumber: 0,
            pageInit: false,
            total: 0,
            showAll: false,
            itemSizeList: [50, 200, 350, 500]
        });

        var itemsPerPage = this.settings.itemsPerPage;
        var itemSizeList = this.settings.itemSizeList;

        // If itemSizeList doesn't contain the desired itemsPerPage,
        // then find the right spot in itemSizeList and insert the
        // itemsPerPage value
        if (!_.contains(itemSizeList, itemsPerPage)) {
            var index = _.sortedIndex(itemSizeList, itemsPerPage);
            itemSizeList.splice(index, 0, itemsPerPage);
        }

        // If the user has chosen a desired itemsPerPage, make sure we're respecting that
        if (!_.isUndefined(selectedItemsPerPage) && _.contains(itemSizeList, selectedItemsPerPage)) {
            this.settings.itemsPerPage = selectedItemsPerPage;
        }
    }

    return {
        createInstance: function (options) {
            options = options ? options : {};
            var tracking = new PageTrackingObject(options);
            return tracking.settings;
        },

        userSelectedItemsPerPage: function (itemsPerPage) {
            selectedItemsPerPage = itemsPerPage;
        }
    };
})

/**
*
* @ngdoc filter
* @name encore.ui.rxPaginate:Paginate
* @description
* This is the pagination filter that is used to calculate the division in the
* items list for the paging.
*
* @param {Object} items The list of items that are to be sliced into pages
* @param {Object} pager The instance of the PageTracking service. If not
* specified, a new one will be created.
*
* @returns {Object} The list of items for the current page in the PageTracking object
*/
.filter('Paginate', function (PageTracking) {
    return function (items, pager) {
        if (!pager) {
            pager = PageTracking.createInstance();
        }
        if (pager.showAll) {
            pager.total = items.length;
            return items;
        }
        if (items) {
            pager.total = items.length;
            pager.totalPages = Math.ceil(pager.total / pager.itemsPerPage);

            var first = pager.pageNumber * pager.itemsPerPage;
            var added = first + pager.itemsPerPage;
            var last = (added > items.length) ? items.length : added;

            pager.first = first + 1;
            pager.last = last;

            return items.slice(first, last);
        }
    };
})

/**
 * @ngdoc filter
 * @name encore.ui.rxPaginate:PaginatedItemsSummary
 * @description
 * Given an active pager (i.e. the result of PageTracking.createInstance()),
 * return a string like "26-50 of 500", when on the second page of a list of
 * 500 items, where we are displaying 25 items per page
 *
 * @param {Object} pager The instance of the PageTracking service. If not
 *
 * @returns {String} The list of page numbers that will be displayed.
 */
.filter('PaginatedItemsSummary', function () {
    return function (pager) {
        var template = '<%= first %>-<%= last %> of <%= total %>';
        if (pager.showAll || pager.itemsPerPage > pager.total) {
            template = '<%= total %>';
        }
        return _.template(template, {
            first: pager.first,
            last: pager.last,
            total: pager.total
        });
    };
})
/**
*
* @ngdoc filter
* @name encore.ui.rxPaginate:Page
* @description
* This is the pagination filter that is used to limit the number of pages
* shown
*
* @param {Object} pager The instance of the PageTracking service. If not
* specified, a new one will be created.
*
* @returns {Array} The list of page numbers that will be displayed.
*/
.filter('Page', function (PageTracking) {
    return function (pager) {
        if (!pager) {
            pager = PageTracking.createInstance();
        }

        var displayPages = [],
            // the next four variables determine the number of pages to show ahead of and behind the current page
            pagesToShow = pager.pagesToShow || 5,
            pageDelta = (pagesToShow - 1) / 2,
            pagesAhead = Math.ceil(pageDelta),
            pagesBehind = Math.floor(pageDelta);

        if (pager && pager.length !== 0) {
                // determine starting page based on (current page - (1/2 of pagesToShow))
            var pageStart = Math.max(Math.min(pager.pageNumber - pagesBehind, pager.totalPages - pagesToShow), 0),

                // determine ending page based on (current page + (1/2 of pagesToShow))
                pageEnd = Math.min(Math.max(pager.pageNumber + pagesAhead, pagesToShow - 1), pager.totalPages - 1);

            for (pageStart; pageStart <= pageEnd; pageStart++) {
                // create array of page indexes
                displayPages.push(pageStart);
            }
        }

        return displayPages;
    };

});
