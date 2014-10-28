/*jshint unused:false*/
angular.module('demoApp').controller('rxIdentityCtrl', function ($scope, Identity) {
    $scope.user = {};
    $scope.login = function () {
        $scope.toggle = true;
        Identity.login($scope.user,
            function (authToken) {
                $scope.toggle = false;
                alert('Congrats! Logged In');
            },
            function (error) {
                $scope.toggle = false;
                alert('Login attempt failed.');
            });
    };
});
