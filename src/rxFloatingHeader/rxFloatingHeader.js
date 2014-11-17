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
                seenFirstScroll = false,
                clones = [],
                trs = [],
                ths = [],
                header = angular.element(element.find('thead'));

            // Grab all the original `tr` elements from the `thead`,
            _.each(header.find('tr'), function (tr) {
                tr = angular.element(tr);
                var clone = tr.clone();
                clones.push(clone);
                tr.css({ 'width': '100%' });
                trs.push(tr);
                ths = ths.concat(_.map(tr.find('th'), angular.element));
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
                        var thWidths = [],
                            trHeights = [];

                        // Get the current width of each `th` and height of each `tr`
                        // that we want to float
                        _.each(trs, function (tr) {
                            trHeights.push($window.getComputedStyle(tr[0]).height);
                            thWidths = thWidths.concat(_.map(tr.find('th'), function (th) {
                                return $window.getComputedStyle(th).width;
                            }));
                        });

                        // Put the cloned `tr` elements back into the DOM
                        _.each(clones, function (clone) {
                            header.append(clone);
                            scope.$digest();
                        });

                        // Apply the rx-floating-header class to each `tr` and
                        // set a correct `top` for each, to make sure they stack
                        // properly
                        var topOffset = 0;
                        _.each(trs, function (tr, index) {
                            tr = angular.element(tr);
                            tr.addClass('rx-floating-header');
                            //tr.css({ 'width': $window.getComputedStyle(tr[0]).width });
                            tr.css({ 'top': topOffset });
                            topOffset += trHeights[index];
                        });

                        // Explicitly set the widths of each `th` element
                        _.each(_.zip(ths, thWidths), function (pair) {
                            var th = pair[0];
                            var width = pair[1];
                            th.css({ 'width': width });
                        });
                    }

                } else {
                    if (state === 'float' || !seenFirstScroll) {
                        state = 'fixed';
                        seenFirstScroll = true;
                        _.each(trs, function (tr) {
                            tr.removeClass('rx-floating-header');
                        });

                        // Detach each cloaned `tr` from the DOM,
                        // but don't destroy it
                        _.each(clones, function (clone) {
                            if (clone[0].parentNode) {
                                header[0].removeChild(clone[0]);
                            }
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
