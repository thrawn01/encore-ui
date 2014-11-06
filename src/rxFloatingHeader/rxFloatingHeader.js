angular.module('encore.ui.rxFloatingHeader', [])
.directive('rxFloatingArea', function ($window) {
    return {
        restrict: 'A',
        scope: {},
        link: function (scope, element) {
            scope.updateHeaders = function () {
                var offset = element[0].getBoundingClientRect(),
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
                headerRow.css('width', headerRow[0].width);
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
