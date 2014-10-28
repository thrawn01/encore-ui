/*jshint unused:false*/
angular.module('demoApp').controller('rxFeedbackCtrl', function ($scope, rxNotify) {
    $scope.alwaysSucceed = function () {
        rxNotify.add('Thanks for your feedback!', {
            type: 'success',
            timeout: 3
        });
    };

    $scope.alwaysFail = function () {
        rxNotify.add('Feedback not received!', {
            type: 'error',
            timeout: 3
        });
    };
});
