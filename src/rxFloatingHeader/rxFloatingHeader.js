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
            scope.updateHeaders = function () {
                var offset = getOffset(element),
                    scrollTop = document.body.scrollTop;
                              
                if ((scrollTop > offset.top) && (scrollTop < offset.top + element[0].offsetHeight)) {
                    scope.floatingHeader.css({
                        'visibility': 'visible'
                    });
                } else {
                    scope.floatingHeader.css({
                        'visibility': 'hidden'
                    });
                }

            };

            scope.updateHeaders();

        },
        controller: function ($scope, $window) {
            this.registerHeader = function (headerRow) {
                $scope.floatingHeader = headerRow;
                $scope.headerClone = headerRow.clone();
                // jquery lite doesn't have .before(), so we use this
                // http://stackoverflow.com/questions/21788314/angularjs-implement-elements-before-method-without-jquery
                headerRow.parent()[0].insertBefore($scope.headerClone[0], headerRow[0]);
                headerRow.css('width', headerRow[0].offsetWidth);
                headerRow.addClass('rx-floating-header');

                angular.element($window).bind('scroll', function () {
                    $scope.updateHeaders();
                    $scope.$apply();
                });
            };
        }
    };
})

.directive('rxFloatingHeader', function () {
    return {
        restrict: 'A',
        require: '^rxFloatingArea',
        link: function (scope, element, attrs, floatingAreaCtrl) {
            floatingAreaCtrl.registerHeader(element);
        }
    };
});
