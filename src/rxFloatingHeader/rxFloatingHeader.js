angular.module('encore.ui.rxFloatingHeader', [])
.directive('rxFloatingArea', function ($window) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var updateHeaders = function () {
                var offset = element.getBoundingClientRect(),
                    scrollTop = $window.scrollTop,
                    
                    

            };
            $window.scroll(updateHeaders);
            $window.trigger("scroll");

        },
        controller: function ($scope) {
            this.registerHeader = function (headerRow) {
                var headerClone = headerRow.clone();
                // jquery lite doesn't have .before(), so we use this
                // http://stackoverflow.com/questions/21788314/angularjs-implement-elements-before-method-without-jquery
                headerRow.parent()[0].insertBefore(headerClone[0], headerRow[0]);
                headerRow.css("width", headerRow[0].width);
                headerRow.addClass("rx-floating-header");
            };
        }
    };
})

.directive('rxFloatingHeader', function () {
    return {
        restrict: 'A',
        requires: 'rxFloatingArea',
        link: function (scope, element, attrs, floatingAreaCtrl) {
            floatingAreaCtrl.registerHeader(element);
        }
    };
});
