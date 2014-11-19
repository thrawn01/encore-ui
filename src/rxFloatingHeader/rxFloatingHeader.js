angular.module('encore.ui.rxFloatingHeader', [])
.directive('rxFloatingArea', function ($window, $document, rxJq) {
    return {
        restrict: 'A',
        scope: {},
        link: function (scope, table) {

            var state = 'fixed',
                seenFirstScroll = false,

                // The original <tr> elements
                trs = [],

                // The original <th> elements
                ths = [],

                // Clones of the <tr> elements
                clones = [],
                maxHeight,
                header = angular.element(table.find('thead'));

            // Grab all the original `tr` elements from the `thead`,
            _.each(header.find('tr'), function (tr) {
                tr = angular.element(tr);
                clones.push(tr.clone());
                trs.push(tr);
                ths = ths.concat(_.map(tr.find('th'), angular.element));
            });

            scope.updateHeaders = function () {
                if (_.isUndefined(maxHeight)) {
                    maxHeight = table[0].offsetHeight;
                }

                maxHeight = _.max([maxHeight, table[0].offsetHeight]);
                
                if (rxJq.shouldFloat(table, maxHeight)) {
                    if (state === 'fixed') {
                        state = 'float';
                        var thWidths = [],
                            trHeights = [];

                        // Get the current height of each `tr` that we want to float
                        _.each(trs, function (tr) {
                            trHeights.push(rxJq.height(tr));
                        });

                        // Grab the current widths of each `th` that we want to float
                        thWidths = _.map(ths, rxJq.width);

                        // Put the cloned `tr` elements back into the DOM
                        _.each(clones, function (clone) {
                            header.append(clone);
                        });

                        // Apply the rx-floating-header class to each `tr` and
                        // set a correct `top` for each, to make sure they stack
                        // properly
                        // We previously did tr.css({ 'width': rxJq.width(tr) })
                        // but it *seems* that setting the widths of the `th` is enough
                        var topOffset = 0;
                        _.each(trs, function (tr, index) {
                            tr.addClass('rx-floating-header');
                            tr.css({ 'top': topOffset });
                            topOffset += trHeights[index];
                        });

                        // Explicitly set the widths of each `th` element that we floated
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
                            clone.remove();
                        });
                    }
                }

            };

            rxJq.onscroll(function () {
                scope.updateHeaders();
                scope.$apply();
            });

        },
    };
})

/**
 * @ngdoc service
 * @name encore.ui.rxFloatingHeader:rxJq
 * @description
 * A small set of functions to provide some functionality
 * that isn't present in Angular's jQuery-lite, and other 
 * DOM-related functions that are useful
 *
 * All methods take jquery-lite wrapped elements as arguments
 */
.factory('rxJq', function ($document, $window) {
    
    var offset = function (elm) {
        //http://cvmlrobotics.blogspot.co.at/2013/03/angularjs-get-element-offset-position.html
        var rawDom = elm[0];
        var _x = 0;
        var _y = 0;
        var doc = $document[0];
        var body = doc.documentElement || doc.body;
        var scrollX = $window.pageXOffset || body.scrollLeft;
        var scrollY = $window.pageYOffset || body.scrollTop;
        _x = rawDom.getBoundingClientRect().left + scrollX;
        _y = rawDom.getBoundingClientRect().top + scrollY;
        return { left: _x, top:_y };
    };

    var style = function (elem) {
        if (elem instanceof angular.element) {
            elem = elem[0];
        }
        return $window.getComputedStyle(elem);
    };

    var width = function (elem) {
        return style(elem).width;
    };
    
    var height = function (elem) {
        return style(elem).height;
    };

    var shouldFloat = function (elem, maxHeight) {
        var elemOffset = offset(elem),
            // Safari and Chrome both use body.scrollTop, but Firefox needs
            // documentElement.scrollTop
            scrollTop = $document[0].body.scrollTop || $document[0].documentElement.scrollTop;

        return ((scrollTop > elemOffset.top) && (scrollTop < elemOffset.top + maxHeight));
    };

    // bind `f` to the scroll event
    var onscroll = function (f) {
        angular.element($window).bind('scroll', f);
    };

    return {
        offset: offset,
        width: width,
        height: height,
        shouldFloat: shouldFloat,
        onscroll: onscroll,
    };
});
