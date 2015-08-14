angular.module('encore.ui.rxTags', ['encore.ui.rxMisc', 'ui.bootstrap'])
/**
 * @ngdoc filter
 * @name encore.ui.rxTags:xor
 * @description
 * Returns the exclusive or of two arrays.
 *
 * @param {Array} array The first input array
 * @param {Array} excluded The second input array
 * @returns {Array} - A new array of the unique elements in each array.
 */
.filter('xor', function () {
    return function () {
        return _.xor.apply(_, arguments);
    };
})

/**
 * @ngdoc directive
 * @name encore.ui.rxTags:rxTags
 * @description
 *
 * @param {Array} options - The list available tags.
 * @param {String=} [key=undefined] - Determines a value of the tag object to use when binding an option to the model.
 * If not provided, the tag object is used.
 */
.directive('rxTags', function (rxDOMHelper) {
    return {
        templateUrl: 'templates/rxTags.html',
        restrict: 'E',
        require: 'ngModel',
        scope: {
            options: '=',
        },
        link: function (scope, element, attrs, ngModelCtrl) {
            var container = rxDOMHelper.find(element, '.rx-tags')[0];
            var input = element.find('input')[0];

            function changeFocus (event) {
                (event.target.previousElementSibling || input).focus();
            }

            attrs.$observe('disabled', function (disabled) {
                scope.disabled = (disabled === '') || disabled;
            });

            scope.focusInput = function (event) {
                if (event.target === container) {
                    input.focus();
                }
            };

            scope.removeIfBackspace = function (event, tag) {
                if (event.keyCode === 8) {
                    event.preventDefault();
                    scope.remove(tag);
                    changeFocus(event);
                }
            };

            scope.focusTag = function (event, value) {
                if (event.keyCode === 8 && _.isEmpty(value)) {
                    changeFocus(event);
                }
            };

            scope.add = function (tag) {
                scope.tags.push(tag);
                ngModelCtrl.$setViewValue(scope.tags);
                scope.newTag = '';
            };

            scope.remove = function (tag) {
                _.remove(scope.tags, tag);
                ngModelCtrl.$setViewValue(scope.tags);
                input.focus();
            };

            if (!_.isEmpty(attrs.key)) {
                ngModelCtrl.$parsers.push(function ($viewValue) {
                    return _.pluck($viewValue, attrs.key);
                });

                ngModelCtrl.$formatters.push(function ($modelValue) {
                    return scope.options.filter(function (option) {
                        return _.contains($modelValue, option[attrs.key]);
                    });
                });
            }

            ngModelCtrl.$render = function () {
                scope.tags = ngModelCtrl.$viewValue || [];
            };
        }
    };
});
