angular.module('demoApp').controller('rxSessionCtrl', function ($scope, Session) {
    $scope.isAuthenticated = function () {
        alert(Session.isAuthenticated());
    };
});
