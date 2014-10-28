angular.module('demoApp').controller('rxAuthCtrl', function ($scope, Auth) {
    $scope.hasRole = function () {
        alert('Has "superhero" Role? : ' + Auth.hasRole('superhero'));
    };

    $scope.isAuthenticated = function () {
        alert('Is Authenticated? : ' + Auth.isAuthenticated());
    };
});
