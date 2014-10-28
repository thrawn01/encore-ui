angular.module('demoApp').controller('rxSessionStorageCtrl', function ($scope, SessionStorage) {
    $scope.setSideKick = function () {
        SessionStorage.setItem('Batman', 'Robin');
    };

    $scope.getSideKick = function () {
        alert(SessionStorage.getItem('Batman'));
    };
});
