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
            scope.trs = [];
            // http://stackoverflow.com/questions/21788314/angularjs-implement-elements-before-method-without-jquery
            //scope.headerClone = scope.header.parent()[0].insertBefore(scope.header.clone()[0], scope.header[0]);
            _.each(scope.header.find('tr'), function(tr) {
                tr = angular.element(tr);
                tr.parent()[0].insertBefore(tr.clone()[0], tr[0]);
                tr.css({ 'width': $window.getComputedStyle(tr[0]).width });
                //scope.header.append(tr.clone());
                tr.addClass('please-look-here');
                scope.trs.push(tr);
            });

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
                        //scope.header.addClass('rx-floating-header');
                        _.each(scope.trs, function(tr) {
                            tr = angular.element(tr);
                            tr.css({ 'width': $window.getComputedStyle(tr[0]).width });
                            _.each(_.zip(tr.find('th'), scope.thWidths), function (pair) {
                                var th = pair[0];
                                var width = pair[1];
                                console.log('Setting width ' + width);
                                angular.element(th).css({ 'width': width });
                            });
                            tr.addClass('rx-floating-header');
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
    };
});
