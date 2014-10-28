angular.module('demoApp').controller('rxLocalStorageCtrl', function ($scope, LocalStorage) {
    $scope.setSideKick = function () {
        LocalStorage.setObject('joker', { name: 'Harley Quinn' });
    };

    $scope.getSideKick = function () {
        var sidekick = LocalStorage.getObject('joker');
        alert(sidekick.name);
    };
});
