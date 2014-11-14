angular.module('encore.ui.rxScrollableTable', [])
.directive('rxScrollableTable', ['$timeout', '$q', '$parse', function ($timeout, $q, $parse) {
    return {
        transclude: true,
        restrict: 'E',
        scope: {
            rows: '=watch',
            sortFn: '='
        },
        template: '<div class="scrollableContainer">' +
          '<div class="headerSpacer"></div>' +
          '<div class="scrollArea" ng-transclude></div>' +
          '</div>',
        controller: function ($scope, $element, $attrs, $window) {
            // define an API for child directives to view and modify sorting parameters
            var _getScale = function (sizeCss){
                var size = sizeCss.replace(/px|%/, '');
                return size ? _.parseInt(size) : 0;
            };

            // takes a raw DOM element
            var style = function (elem) {
                return $window.getComputedStyle(elem);
            };

            var getWidth = function (elem) {
                return _getScale(style(elem).width);
            };

            var getHeight = function (elem) {
                return _getScale(style(elem).height);
            };

            var getThInner = function () {
                return _.filter($element[0].querySelectorAll('table th .th-inner'), function (th) {
                    return !hidden(th);
                });
            };

            var element = $element[0];
            var scrollArea = angular.element(element.querySelectorAll('.scrollArea')[0]);

            // Given a raw DOM element, check if it's currently hidden
            // This is a modified version of 
            // http://stackoverflow.com/questions/9637943/non-jquery-equivalent-of-visible-in-javascript
            var hidden = function( elem ) {
                var width = elem.offsetWidth,
                    height = elem.offsetHeight;
                return ( width === 0 && height === 0 ) || (elem.style.display === 'none');
            };

            this.getSortExpr = function () {
                return $scope.sortExpr;
            };
            this.isAsc = function () {
                return $scope.asc;
            };
            this.setSortExpr = function (exp) {
                $scope.asc = true;
                $scope.sortExpr = exp;
            };
            this.toggleSort = function () {
                $scope.asc = !$scope.asc;
            };

            this.doSort = function (comparatorFn) {
                if (comparatorFn) {
                    $scope.rows.sort(function (r1, r2) {
                        var compared = comparatorFn(r1, r2);
                        return $scope.asc ? compared : compared * -1;
                    });
                } else {
                    $scope.rows.sort(function (r1, r2) {
                        var compared = defaultCompare(r1, r2);
                        return $scope.asc ? compared : compared * -1;
                    });
                }
            };

            this.resizeColumn = function (){
                fixHeaderWidths();
            };

            function defaultCompare(row1, row2) {
                var exprParts = $scope.sortExpr.match(/(.+)\s+as\s+(.+)/);
                var scope = {};
                scope[exprParts[1]] = row1;
                var x = $parse(exprParts[2])(scope);

                scope[exprParts[1]] = row2;
                var y = $parse(exprParts[2])(scope);

                if (x === y) {
                    return 0;
                }
                return x > y ? 1 : -1;
            }

            // Set fixed widths for the table headers in case the text overflows.
            // There's no callback for when rendering is complete, so check the visibility of the table
            // periodically -- see http://stackoverflow.com/questions/11125078
            function waitForRender() {
                var deferredRender = $q.defer();
                function wait() {
                    if (hidden($element.find('table')[0])) {
                        $timeout(wait, 100);
                    } else {
                        deferredRender.resolve();
                    }
                }

                $timeout(wait);
                return deferredRender.promise;
            }

            var headersAreFixed = $q.defer();

            function fixHeaderWidths() {
                if (!getThInner().length) {
                    _.each(element.querySelectorAll('thead th'), function (th) {
                        angular.element(angular.element(th).contents()).wrap('<div class="th-inner"><div class="box"></div></div>');
                    });
                }
                var headerPos = 1;//  1 is the width of right border;
                _.each(getThInner(), function (th) {
                    var jqTh = angular.element(th);
                    var jqParent = jqTh.parent();
                    var width = getWidth(jqParent[0]);
                        // if it's the last header, add space for the scrollbar equivalent unless it's centered
                        lastCol = angular.element(_.last(_.reject(element.querySelectorAll('table th'), hidden))),
                        headerWidth = width;
                    if (lastCol.css('text-align') !== 'center') {
                        var scrollAreaHeight = getHeight(scrollArea[0]);
                        var tableHeight = getHeight($element.find('table')[0]);
                        var hasScrollbar = scrollAreaHeight < tableHeight;
                        if (lastCol[0] == jqParent[0] && hasScrollbar) {
                            headerWidth += getWidth(scrollArea[0]) - getWidth(element.querySelectorAll('tbody tr')[0]);
                            headerWidth = Math.max(headerWidth, width);
                        }
                    }
                    var minWidth = _getScale(jqParent.css('min-width')),
                        title = jqParent.attr('title');
                    width = Math.max(minWidth, width);
                    headerWidth = Math.max(minWidth, headerWidth);
                    jqTh.css({ 'width': headerWidth + 'px'});
                    if (!title) {
                        title = jqTh.children().length ? angular.element(th.querySelectorAll('.ng-scope')).html() : jqTh.html();
                    }
                    jqTh.attr('title', title.trim());

                    //following are resize stuff, to made th-inner position correct.
                    //last column's width should be automaically, to avoid horizontal scroll.
                    if (lastCol[0] != jqParent[0]){
                        jqParent.css({ 'width': width + 'px' });
                    }
                    jqTh.css({ 'left': headerPos });
                    headerPos += width;
                });
                headersAreFixed.resolve();
            }

            function _resetColumnsSize(tableWidth){
                var ths = element.querySelectorAll('table th'),
                    lastCol = _.last(ths),
                    columnLength = ths.length;

                _.each(ths, function (el) {
                    el = angular.element(el);
                    if(lastCol[0] == el[0]){
                        //last column's width should be automaically, to avoid horizontal scroll.
                        return;
                    }
                    var _width = el.data('width');
                    if(/\d+%$/.test(_width)){    //percentage
                        _width = Math.ceil(tableWidth * _getScale(_width) / 100);
                    } else {
                        // if data-width not exist, use average width for each columns.
                        _width = tableWidth / columnLength;
                    }
                    el.css({ 'width': _width + 'px' });

                });
                waitForRender().then(fixHeaderWidths);
            }

            angular.element(window).on('resize', function(){
                $scope.$apply();
            });
            $scope.$watch(function(){
                return getWidth(scrollArea[0]);
            }, function(newWidth, oldWidth){
                var _containerWidth = newWidth,
                    _containerOldWidth = oldWidth;
                if(_containerWidth * _containerOldWidth === 0){
                    return;
                }
                _resetColumnsSize(_containerWidth);
            });

            // when the data model changes, fix the header widths.  See the comments here:
            // http://docs.angularjs.org/api/ng.$timeout
            $scope.$watch('rows', function (newValue) {
                if (newValue) {
                    waitForRender().then(fixHeaderWidths);
                    // clean sort status and scroll to top of table once records replaced.
                    $scope.sortExpr = null;
                    scrollArea[0].scrollIntoView(true);
                    _resetColumnsSize(getWidth(scrollArea[0]));
                }
            });

            $scope.asc = !$attrs.hasOwnProperty('desc');
            $scope.sortAttr = $attrs.sortAttr;

            scrollArea.bind('scroll', function (ev) {
                _.each(getThInner(), function (th) {
                    angular.element(th).css({ 'margin-left': 0 - ev.target.scrollLeft });
                });
            });

            $scope.$on('renderScrollableTable', function() {
                $timeout(fixHeaderWidths);
            });
        }
    };
}]);

