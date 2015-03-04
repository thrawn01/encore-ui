angular.module('encore.ui.rxPaginate', ['encore.ui.rxLocalStorage'])
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
        replace: true,
        restrict: 'E',
        scope: {
            pageTracking: '=',
            numberOfPages: '@',
            filterText: '=?',
            sortPredicate: '=?',
            sortDirection: '=?'
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
                scope.pageTracking.setItemsPerPage(itemsPerPage);

                // Set itemsPerPage as the new default value for
                // all future pagination tables
                PageTracking.userSelectedItemsPerPage(itemsPerPage);
            };

            scope.scrollToTop = function () {
                table[0].scrollIntoView(true);
            };

            scope.loadingState = '';
            var setLoading = function (state) {
                scope.loadingState = state;
            };

            var filterAndSort = function () {
                return {
                    filterText: scope.filterText,
                    sortPredicate: scope.sortPredicate,
                    sortDirection: scope.sortDirection
                };
            };
            scope.pageTracking.notifyLoading(setLoading);
            scope.pageTracking.filterAndSortAccess(filterAndSort);

            if (!_.isUndefined(scope.filterText)) {
                scope.$watch('filterText', _.debounce(function (newText) {
                    scope.$apply(function () {
                        scope.pageTracking.updateFilterText(newText);
                    });
                }, 500));
            }
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
.factory('PageTracking', function ($q, LocalStorage, rxPaginateUtils) {

    function PageTrackingObject (opts, serverAPI) {
        var settings = _.defaults(_.cloneDeep(opts), {
            itemsPerPage: 200,
            pagesToShow: 5,
            pageNumber: 0,
            pageInit: false,
            total: 0,
            showAll: false,
            itemSizeList: [50, 200, 350, 500]
        });

        serverAPI = serverAPI || {
            getItems: function () {
                var items = [];
                items.totalNumberOfItems = 0;
                return $q.when(items);
            }
        };

        var itemsPerPage = settings.itemsPerPage;
        var itemSizeList = settings.itemSizeList;

        // If itemSizeList doesn't contain the desired itemsPerPage,
        // then find the right spot in itemSizeList and insert the
        // itemsPerPage value
        if (!_.contains(itemSizeList, itemsPerPage)) {
            var index = _.sortedIndex(itemSizeList, itemsPerPage);
            itemSizeList.splice(index, 0, itemsPerPage);
        }

        var selectedItemsPerPage = parseInt(LocalStorage.getItem('rxItemsPerPage'));

        // If the user has chosen a desired itemsPerPage, make sure we're respecting that
        // However, a value specified in the options will take precedence
        if (!opts.itemsPerPage && !_.isNaN(selectedItemsPerPage) && _.contains(itemSizeList, selectedItemsPerPage)) {
            settings.itemsPerPage = selectedItemsPerPage;
        }

        var filterAndSort = function () {
            return {
                filterText: '',
                sortPredicate: '',
                sortDirection: ''
            };
        };

        settings.filterAndSortAccess = function (fn) {
            filterAndSort = fn;
        };

        settings.isFirstPage = function () {
            return settings.isPage(0);
        };

        settings.isLastPage = function () {
            return settings.isPage(settings.totalPages - 1);
        };

        settings.isPage = function (n) {
            return settings.pageNumber === n;
        };
        
        settings.isNLastPage = function (n) {
            return settings.totalPages - 1 === n;
        };
        
        settings.currentPage = function () {
            return settings.pageNumber;
        };
        
        // 0-based page number
        settings.goToPage = function (n) {
            settings.pageNumber = n;
            settings.setLoading();
            var val = filterAndSort();
            serverAPI.getItems(n, settings.itemsPerPage, val.filterText, val.sortPredicate, val.sortDirection)
                .then(settings.clearLoading);
        };

        settings.updateFilterText = function (text, sortPredicate, sortReverse) {
            settings.setLoading();
            var response = serverAPI.getItems(0, // Always go to page 0 when filter text changes
                                               settings.itemsPerPage,
                                               text,
                                               sortPredicate,
                                               sortReverse);
            response.then(function (items) {
                settings.pageNumber = items.pageNumber;
                rxPaginateUtils.updatePager(settings, items.totalNumberOfItems);
                settings.clearLoading();
            });
        };

        // The sorting has changed, but not the filter text, so we'll stay
        // on the same page
        settings.updateSort = function (text, sortPredicate, sortReverse) {
            settings.setLoading();
            var response = serverAPI.getItems(settings.currentPage(),
                               settings.itemsPerPage,
                               text,
                               sortPredicate,
                               sortReverse);
            response.then(settings.clearLoading);
            
        };

        settings.goToFirstPage = function () {
            settings.goToPage(0);
        };

        settings.goToLastPage = function () {
            settings.goToPage(settings.totalPages - 1);
        };

        settings.goToPrevPage = function () {
            settings.goToPage(settings.currentPage() - 1);
        };

        settings.goToNextPage = function () {
            settings.goToPage(settings.currentPage() + 1);
        };

        settings.isEmpty = function () {
            return settings.total === 0;
        };

        settings.setItemsPerPage = function (numItems) {
            settings.itemsPerPage = numItems;
            settings.goToPage(0);
        };

        settings.isItemsPerPage = function (numItems) {
            return settings.itemsPerPage === numItems;
        };

        var notifyLoading = _.noop;
        settings.notifyLoading = function (fn) {
            notifyLoading = fn;
        };

        settings.setLoading = function () {
            notifyLoading('loading');
        };

        settings.clearLoading = function () {
            notifyLoading('');
        };

        this.settings = settings;

        settings.goToPage(settings.pageNumber);
    }

    return {
        createInstance: function (options, serverAPI) {
            options = options ? options : {};
            var tracking = new PageTrackingObject(options, serverAPI);
            return tracking.settings;
        },

        userSelectedItemsPerPage: function (itemsPerPage) {
            LocalStorage.setItem('rxItemsPerPage', itemsPerPage);
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
.filter('Paginate', function (PageTracking, rxPaginateUtils) {
    return function (items, pager) {
        if (!pager) {
            pager = PageTracking.createInstance();
        }
        if (pager.showAll) {
            pager.total = items.length;
            return items;
        }
        if (items) {
             
            var firstLast = rxPaginateUtils.updatePager(pager, items.length);
            return items.slice(firstLast.first, firstLast.last);
        }
    };
})

.filter('LazyPaginate', function (rxPaginateUtils) {
    return function (items, pager) {
        if (items && pager) {
            rxPaginateUtils.updatePager(pager, items.totalNumberOfItems);
        }
        return items;
    };
})

.factory('rxPaginateUtils', function () {
    var rxPaginateUtils = {};

    rxPaginateUtils.updatePager = function (pager, totalNumItems)  {

        pager.total = totalNumItems;
        pager.totalPages = Math.ceil(totalNumItems / pager.itemsPerPage);

        // We were previously on the last page, but enough items were deleted
        // to reduce the total number of pages. We should now jump to whatever the
        // new last page is
        // When loading items over the network, our first few times through here
        // will have totalPages===0. We do the _.max to ensure that
        // we never set pageNumber to -1
        if (pager.pageNumber + 1 > pager.totalPages) {
            pager.pageNumber = _.max([0, pager.totalPages - 1]);
        }

        var first = pager.pageNumber * pager.itemsPerPage;
        var added = first + pager.itemsPerPage;
        var last = (added > totalNumItems) ? totalNumItems : added;

        pager.first = first + 1;
        pager.last = last;

        return {
            first: first,
            last: last
        };
    };

    return rxPaginateUtils;
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
