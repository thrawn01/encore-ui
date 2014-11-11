angular.module('encore.ui.rxFloatingHeader', [])
.directive('rxFloatingArea', function ($window) {
    return {
        restrict: 'A',
        scope: {},
        link: function (scope, element) {
            var getOffset = function (elm) {
                //http://cvmlrobotics.blogspot.co.at/2013/03/angularjs-get-element-offset-position.html
                var rawDom = elm[0];
                var _x = 0;
                var _y = 0;
                var body = document.documentElement || document.body;
                var scrollX = window.pageXOffset || body.scrollLeft;
                var scrollY = window.pageYOffset || body.scrollTop;
                _x = rawDom.getBoundingClientRect().left + scrollX;
                _y = rawDom.getBoundingClientRect().top + scrollY;
                return { left: _x, top:_y };
            };

            var tableHeight,
                state = 'fixed',
                seenFirstScroll = false;

            scope.header = angular.element(element.find('thead'));

            scope.updateHeaders = function () {
                var offset = getOffset(element),
                    scrollTop = document.body.scrollTop;

                if (_.isUndefined(tableHeight)) {
                    tableHeight = element[0].offsetHeight;
                }

                tableHeight = _.max([tableHeight, element[0].offsetHeight]);

                if ((scrollTop > offset.top) && (scrollTop < offset.top + tableHeight)){
                    if (state === 'fixed') {
                        state = 'float';
                        scope.header.addClass('rx-floating-header');
                        _.each(_.zip(scope.header.find('th'), scope.thWidths), function (pair) {
                            var element = pair[0];
                            var width = pair[1];
                            angular.element(element).css({ 'width': width });
                        });
                    }

                } else {
                    if (state === 'float' || !seenFirstScroll) {
                        state = 'fixed';
                        seenFirstScroll = true;
                        scope.header.removeClass('rx-floating-header');
                        scope.thWidths = _.map(scope.header.find('th'), function (th) {
                            return $window.getComputedStyle(th).width;
                        });
                    }
                }

            };

            angular.element($window).bind('scroll', function () {
                scope.updateHeaders();
                scope.$apply();
            });

        },
        controller: function ($scope, $window) {
            this.registerHeader = function (headerRow) {
                $scope.header = headerRow;
                angular.element($window).bind('scroll', function () {
                    $scope.updateHeaders();
                    $scope.$apply();
                });
            };
        }
    };
});
