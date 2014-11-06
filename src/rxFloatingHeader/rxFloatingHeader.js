angular.module('encore.ui.rxFloatingHeader', [])
.directive('rxFloatingArea', function ($window) {
    return {
        restrict: 'A',
        link: function (scope, element) {
            scope.updateHeaders = function () {
                var offset = element.getBoundingClientRect(),
                    scrollTop = $window.scrollTop;
                              
                if ((scrollTop > offset.top) && (scrollTop < offset.top + element.height())) {
                    scope.floatingHeader.css({
                        'visibility': 'visible'
                    });
                } else {
                    scope.floatingHeader.css({
                        'visibility': 'hidden'
                    });
                }

            };

        },
        controller: function ($scope, $window) {
            this.registerHeader = function (headerRow) {
                $scope.floatingHeader = headerRow;
                $scope.headerClone = headerRow.clone();
                // jquery lite doesn't have .before(), so we use this
                // http://stackoverflow.com/questions/21788314/angularjs-implement-elements-before-method-without-jquery
                headerRow.parent()[0].insertBefore($scope.headerClone[0], headerRow[0]);
                headerRow.css('width', headerRow[0].width);
                headerRow.addClass('rx-floating-header');

                $window.scroll($scope.updateHeaders);
                $window.trigger('scroll');
            };
        }
    };
})

.directive('rxFloatingHeader', function () {
    return {
        restrict: 'A',
        require: 'rxFloatingArea',
        link: function (scope, element, attrs, floatingAreaCtrl) {
            floatingAreaCtrl.registerHeader(element);
        }
    };
});
