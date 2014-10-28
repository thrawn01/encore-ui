/*jshint unused:false*/

// This file is used to help build the 'demo' documentation page and should be updated with example code
angular.module('demoApp').controller('rxCompileCtrl', function ($scope) {
    $scope.world = 'wrrrld';
    $scope.myExpression = 'Hello {{world}}';
});
