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
.directive('rxPaginate', function ($q, $compile, PageTracking, rxPaginateUtils) {
    return {
        templateUrl: 'templates/rxPaginate.html',
        replace: true,
        restrict: 'E',
        require: '?^rxLoadingOverlay',
        scope: {
            pageTracking: '=',
            numberOfPages: '@',
            serverInterface: '=?',
            filterText: '=?',
            sortPredicate: '=?',
            sortDirection: '=?'
        },
        link: function (scope, element, attrs, rxLoadingOverlayCtrl) {

            rxLoadingOverlayCtrl = rxLoadingOverlayCtrl || {
                show: _.noop,
                hide: _.noop
            };
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

            scope.show = function () {
                rxLoadingOverlayCtrl.show();
            };

            if (!_.isUndefined(scope.serverInterface)) {
                var cachedPages = [];

                var getItems = function (pageNumber, itemsPerPage) {
                    if (_.contains(cachedPages, pageNumber)) {
                        return $q.when(pageNumber);
                    }
                    scope.loadingState = 'loading';
                    rxLoadingOverlayCtrl.show();
                    var response = scope.serverInterface.getItems(pageNumber,
                                                   itemsPerPage,
                                                   scope.filterText,
                                                   scope.sortPredicate,
                                                   scope.sortDirection);

                    return response.then(function (items) {
                        var updateCache = true;
                        rxPaginateUtils.updatePager(scope.pageTracking,
                                                    items.pageNumber,
                                                    items.totalNumberOfItems,
                                                    items,
                                                    updateCache);
                        cachedPages = scope.pageTracking.cachedPages;
                        return items.pageNumber;
                    })
                    .finally(function () {
                        scope.loadingState = '';
                        rxLoadingOverlayCtrl.hide();
                    });
                };
        
                scope.pageTracking.updateItems(getItems);

                if (!_.isUndefined(scope.filterText)) {
                    scope.$watch('filterText', _.debounce(function () {
                        scope.$apply(function () {
                            var pageNumber = 0;
                            cachedPages = [];
                            getItems(pageNumber, scope.pageTracking.itemsPerPage);
                        });
                    }, 500));
                }

            }

        }
    };
})

/**
 *
 * @ngdoc directive
 * @name encore.ui.rxPaginate:rxLoadingOverlay
 * @restrict A
 * @description
 * This directive can be used to show and hide a "loading" overlay on top
 * of any given element. Add this as an attribute to your element, and then
 * other sibling or child elements can require this as a controller. The controller
 * exposes `show()` and `hide()` methods, which will show/hide the overlay
 *
 */
.directive('rxLoadingOverlay', function ($compile, rxDOMHelper) {
    return {
        restrict: 'A',
        scope: true,
        controller: function ($scope, $element) {
            this.show = function () {
                var offset = rxDOMHelper.offset($element);
                var width = rxDOMHelper.width($element);
                var height = rxDOMHelper.height($element);
                if (!_.isUndefined($scope.loadingBlock)) {
                    $scope.loadingBlock.css({
                        top: offset.top + 'px',
                        left: offset.left + 'px',
                        width: width,
                        height: height,
                    });
                }
                $scope.showLoadingOverlay = true;
            };

            this.hide = function () {
                $scope.showLoadingOverlay = false;
            };
        },
        link: function (scope, element) {
            // This target element has to have `position: relative` otherwise the overlay
            // will not sit on top of it
            element.css({ position: 'relative' });
            scope.showLoadingOverlay = false;

            var loadingBlockHTML = '<div ng-show="showLoadingOverlay" class="loading-overlay">' +
                                        '<p>Loading</p>' +
                                    '</div>';

            $compile(loadingBlockHTML)(scope, function (clone) {
                scope.loadingBlock = clone;
                element.after(clone);
            });
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
.factory('PageTracking', function ($q, LocalStorage) {

    function PageTrackingObject (opts) {
        var settings = _.defaults(_.cloneDeep(opts), {
            itemsPerPage: 200,
            pagesToShow: 5,
            pageNumber: 0,
            pageInit: false,
            total: 0,
            showAll: false,
            itemSizeList: [50, 200, 350, 500]
        });

        var itemsPerPage = settings.itemsPerPage;
        var itemSizeList = settings.itemSizeList;

        var total = settings.total;
        Object.defineProperty(settings, 'total', {
            get: function () {
                    return total;
                },
            set: function (newTotal) {
                    total = newTotal;
                    if (settings.pageNumber + 1 > settings.totalPages) {
                        // We were previously on the last page, but enough items were deleted
                        // to reduce the total number of pages. We should now jump to whatever the
                        // new last page is
                        // When loading items over the network, our first few times through here
                        // will have totalPages===0. We do the _.max to ensure that
                        // we never set pageNumber to -1
                        settings.goToLastPage();
                    }
                }
        });
        
        Object.defineProperty(settings, 'totalPages', {
            get: function () { return Math.ceil(settings.total / settings.itemsPerPage); }
        });

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
        
        var updateItems = function (pageNumber) {
            // This is the function that gets used when doing UI pagination,
            // thus we're not waiting for the page number to come back from a service,
            // so we should set it right away.
            settings.pageNumber = pageNumber;
            return $q.when(pageNumber);
        };
        settings.updateItems = function (fn) {
            updateItems = fn;
        };

        // 0-based page number
        settings.goToPage = function (n) {
            // Set the pageNumber to n. Then when updateItems comes back, set it again,
            // in case the server changed stuff up and had to send us to a new page
            settings.waitingForItems = true;
            return updateItems(n, settings.itemsPerPage).then(function (pageNumber) {
                settings.pageNumber = pageNumber;
                settings.waitingForItems = false;
                return pageNumber;
            });
        };

        settings.goToFirstPage = function () {
            settings.goToPage(0);
        };

        settings.goToLastPage = function () {
            settings.goToPage(_.max([0, settings.totalPages - 1]));
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

        this.settings = settings;

        settings.goToPage(settings.pageNumber);
    }

    return {
        createInstance: function (options) {
            options = options ? options : {};
            var tracking = new PageTrackingObject(options);
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
            
            pager.total = items.length;
            var updateCache = false;
            var firstLast = rxPaginateUtils.updatePager(pager, pager.currentPage(), items.length, items, updateCache);
            return items.slice(firstLast.first, firstLast.last);
        }
    };
})

.filter('LazyPaginate', function (rxPaginateUtils) {
    return function (items, pager) {
        if (items && pager) {
            var info;
            var updateCache = false;
            if (!pager.waitingForItems) {
                var pageNumber = pager.currentPage();
                info = rxPaginateUtils.updatePager(pager, pageNumber, items.totalNumberOfItems, items, updateCache);
            } else {
                // We're waiting on a request for new items to come in, so just keep the current set of items
                // displayed
                info = rxPaginateUtils.firstAndLast(pager.pageNumber, pager.itemsPerPage, items.totalNumberOfItems);
            }
            return items.slice(info.first - pager.cacheOffset, info.last - pager.cacheOffset);
        }
    };
})

.factory('rxPaginateUtils', function () {
    var rxPaginateUtils = {};

    rxPaginateUtils.firstAndLast = function (pageNumber, itemsPerPage, totalNumItems) {
        var first = pageNumber * itemsPerPage;
        var added = first + itemsPerPage;
        var last = (added > totalNumItems) ? totalNumItems : added;

        return {
            first: first,
            last: last,
        };
        
    };

    rxPaginateUtils.updatePager = function (pager, pageNumber, totalNumItems, items, updateCache)  {

        pager.total = totalNumItems;

        var info = rxPaginateUtils.firstAndLast(pageNumber, pager.itemsPerPage, totalNumItems);
        var first = info.first;
        var last = info.last;

        pager.first = first + 1;
        pager.last = last;

        if (updateCache) {
            var numberOfPages = Math.floor(items.length / pager.itemsPerPage);
            var cachedPages = numberOfPages ? _.range(pageNumber, pageNumber + numberOfPages) : [pageNumber];
            pager.cachedPages = !_.isEmpty(cachedPages) ? cachedPages : [pageNumber];
            pager.cacheOffset = pager.cachedPages[0] * pager.itemsPerPage;
        }

        return {
            first: first,
            last: last,
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
