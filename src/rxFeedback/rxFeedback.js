
angular.module('encore.ui.rxFeedback', ['ngResource'])
.value('feedbackTypes', [
    {
        label: 'Software Bug',
        prompt: 'Bug Description',
        placeholder: 'Please be as descriptive as possible so we can track it down for you.'
    },
    {
        label: 'Incorrect Data',
        prompt: 'Problem Description',
        placeholder: 'Please be as descriptive as possible so we can figure it out for you.'
    },
    {
        label: 'Feature Request',
        prompt: 'Feature Description',
        placeholder: 'Please be as descriptive as possible so we can make your feature awesome.'
    },
    {
        label: 'Kudos',
        prompt: 'What made you happy?',
        placeholder: 'We love to hear that you\'re enjoying Encore! Tell us what you like, and what we can do ' +
            'to make it even better'
    }
])
// requires html2canvas
.service('rxScreenshotSvc', function ($log, $q) {
    // double check that html2canvas is loaded
    var hasDependencies = function () {
        var hasHtml2Canvas = typeof html2canvas == 'function';

        return hasHtml2Canvas;
    };

    return {
        capture: function (target) {
            var deferred = $q.defer();

            if (!hasDependencies()) {
                $log.warn('rxScreenshotSvc: no screenshot captured, missing html2canvas dependency');
                deferred.reject('html2canvas not loaded');
            } else {
                html2canvas(target, {
                    onrendered: function (canvas) {
                        var imgData = canvas.toDataURL('image/png');

                        deferred.resolve(imgData);
                    }
                });
            }

            return deferred.promise;
        }
    };
})
.factory('rxFeedbackSvc', function ($resource, feedbackApi, $location, $window) {
    var container = {
        api: undefined,
        email: 'encoreui@lists.rackspace.com'
    };

    container.setEndpoint = function (url) {
        container.api = $resource(url);
    };

    // set a default endpoint
    container.setEndpoint(feedbackApi);

    container.fallback = function (feedback) {
        var subject = 'Encore Feedback: ' + feedback.type.label;
        var body = [
            'Current Page: ' + $location.absUrl(),
            'Browser User Agent: ' + navigator.userAgent,
            'Comments: ' + feedback.description
        ];

        body = body.join('\n\n');

        // if the feedback service fails, this fallback function can be run as a last ditch effort
        var uri = encodeURI('mailto:' + container.email + '?subject=' + subject + '&body=' + body);
        var windowOpen = $window.open(uri, '_blank');

        if (!windowOpen) {
            $window.location.href = uri;
        }
    };

    return container;
})
.factory('UserVoiceMapping', function ($http, $location, $interval, $window) {

    var defaultUserVoiceURL = 'https://get.feedback.rackspace.com/forums/297396';
    var defaultCategoryPrefix = 'category';
    var userVoiceTypes = ['Feature Request'];
    var httpPromise, openPromise;

    // Gets the base HREF parsed from the full URL
    var getBaseHref = function () {
        // Get the full URL
        var route = $location.absUrl();
        // Remove proto://domain:port portion of the URI
        route = '/' + route.split('/').slice(3).join('/');
        // Remove the URL that angular recognizes
        route = route.slice(0, route.length - $location.url().length);

        return route;
    };

    // Fetch the route mappings, if the fetch fails provide a default barebones object
    var fetchRoutes = function () {
        // Make sure we're only fetching once
        if (!httpPromise) {
            // Save the promise to keep using
            httpPromise = $http({
                url: '/encore/feedback/route-map.json',
                cache: true
            }).then(function (response) {
                // We only want the data after this point
                return response.data;
            }, function () {
                // Connection failed to CDN? return an empty object
                return {};
            });
        }
        return httpPromise;
    };

    // Construct the user voice URL along with the proper mapping suffix if needed
    var matchRoute = function (mapping) {
        // Grab the base url in case it has changed from CDN
        var url = mapping.base || defaultUserVoiceURL;
        // Check if we have the category ID for the route
        var route = getBaseHref();
        if (_.has(mapping, route)) {
            // if we have a full static URL just use it
            if (_.contains(mapping[route], 'http')) {
                url = mapping[route];
            } else {
                url += '/' + (mapping.categoryPrefix || defaultCategoryPrefix) + '/' + mapping[route];
            }
        }
        return url;
    };

    // Cancel interval of opening a window
    var cancelOpenWindow = function () {
        if (openPromise) {
            $interval.cancel(openPromise);
        }
        openPromise = undefined;
    };

    // Open a new window with the defined route
    var openWindow = function (scope, route) {
        // reset the open window promise
        openPromise = $interval(function () {
            $window.open(route, '_blank');
        }, 3000, 1, false);

        // Set the flag for showing the cancel redirect button
        scope.loadingUserVoice = true;

        // On fulfillment of the process, mark the button to be hidden no matter what
        openPromise.finally(function () {
            scope.loadingUserVoice = false;
        });

        // Let's return the route for any other functions to use it
        return route;
    };

    return {
        cancelOpen: cancelOpenWindow,
        watch: function watchValue (type, old, scope) {
            // By Default we do not want to show the redirect message
            scope.showRedirectMessage = false;

            // Let's cancel any attempts to open a window
            // Otherwise this creates an unsavory behavior of changing values and
            // a random window opens
            cancelOpenWindow();

            // Let's prefetch route maps only when the watch has been set up
            // Caching will make sure that the network request only happens once
            fetchRoutes();

            // Check if we are doing "Feature Requests"
            if (type && _.contains(userVoiceTypes, type.label)) {
                scope.showRedirectMessage = true;

                // Get the route mapping, match the current route,
                fetchRoutes()
                    .then(matchRoute)
                    .then(_.partial(openWindow, scope))
                    .then(function (route) {
                        // This is sugar for the template only
                        scope.route = route;
                    });
            }
        }
    };

})
.directive('rxFeedback', function (feedbackTypes, $location, rxFeedbackSvc, rxScreenshotSvc, rxNotify, Session,
           UserVoiceMapping) {
    return {
        restrict: 'E',
        templateUrl: 'templates/rxFeedback.html',
        scope: {
            sendFeedback: '=?onSubmit'
        },
        link: function (scope) {
            scope.feedbackTypes = feedbackTypes;

            scope.cancelOpen = function () {
                UserVoiceMapping.cancelOpen();
            };

            scope.setCurrentUrl = function (modalScope) {
                modalScope.currentUrl = $location.url();
                modalScope.$watch('fields.type', UserVoiceMapping.watch);
            };

            var showSuccessMessage = function (response) {
                var message = _.isString(response.message) ? response.message : 'Thanks for your feedback!';

                rxNotify.add(message, {
                    type: 'success'
                });
            };

            var showFailureMessage = function (httpResponse) {
                var errorMessage = 'An error occurred submitting your feedback';

                if (httpResponse.data && _.isString(httpResponse.data.message)) {
                    errorMessage += ': ' + httpResponse.data.message;
                }

                rxNotify.add(errorMessage, {
                    type: 'error'
                });
            };

            var makeApiCall = function (feedback, screenshot) {
                rxFeedbackSvc.api.save({
                    type: feedback.type.label,
                    description: feedback.description,
                    screenshot: screenshot,
                    sso: feedback.sso
                }, showSuccessMessage, function (httpResponse) {
                    showFailureMessage(httpResponse);

                    rxFeedbackSvc.fallback(feedback);
                });
            };

            if (!_.isFunction(scope.sendFeedback)) {
                scope.sendFeedback = function (feedback) {
                    feedback.sso = Session.getUserId();

                    var root = document.querySelector('.rx-app');

                    // capture screenshot
                    var screenshot = rxScreenshotSvc.capture(root);

                    screenshot.then(function (dataUrl) {
                        makeApiCall(feedback, dataUrl);
                    }, function (reason) {
                        makeApiCall(feedback, reason);
                    });
                };
            }
        }
    };
});
