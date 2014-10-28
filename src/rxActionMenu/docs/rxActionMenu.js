/*jshint unused:false*/
angular.module('demoApp').controller('rxActionMenuCtrl', function ($scope, rxNotify) {

    $scope.add = function () {
        rxNotify.add('Added!', {
            type: 'success',
            repeat: false,
            timeout: 3
        });
    };

    $scope.remove = function () {
        rxNotify.add('Deleted!', {
            type: 'error',
            repeat: false,
            timeout: 3
        });
    };

});
