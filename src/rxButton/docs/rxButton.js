/*jshint unused:false*/
angular.module('demoApp').controller('rxButtonCtrl', function ($scope, $timeout) {
    $scope.status = {
        loading: false,
        disable: true
    };

    $scope.login = function () {
        $scope.status.loading = true;

        $timeout(function () {
            $scope.status.loading = false;
        }, 4000);
    };
});
