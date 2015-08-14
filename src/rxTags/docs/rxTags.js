/*jshint unused:false*/
angular.module('demoApp')
.controller('rxTagsCtrl', function ($scope) {
    $scope.tagOptions = [
        { text: 'apple', category: 'fruit' },
        { text: 'orange', category: 'fruit' },
        { text: 'banana', category: 'fruit' },
        { text: 'squash', category: 'vegetable' }
    ];
    $scope.tags = ['apple'];
});
