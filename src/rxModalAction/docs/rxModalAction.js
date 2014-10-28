/*jshint unused:false*/
angular.module('demoApp').controller('rxModalActionCtrl', function ($scope) {
    $scope.password = 'guest';

    $scope.populate = function (modalScope) {
        modalScope.user = 'hey_dude';
    };

    $scope.changePass = function (fields) {
        $scope.password = fields.password;
    };
});
