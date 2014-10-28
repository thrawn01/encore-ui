/*jshint unused:false*/

// This file is used to help build the 'demo' documentation page and should be updated with example code
angular.module('demoApp').controller('rxSortableColumnCtrl', function ($scope, PageTracking, rxSortUtil) {
    $scope.sort = rxSortUtil.getDefault();
    $scope.pager = PageTracking.createInstance();

    $scope.sortCol = function (predicate) {
        return rxSortUtil.sortCol($scope, predicate);
    };

    $scope.talentPool = [
        {
            name: 'Andrew Yurisich',
            jobTitle: 'Mailroom Associate IV'
        },
        {
            name: 'Patrick Deuley',
            jobTitle: 'Design Chaplain'
        },
        {
            name: 'Hussam Dawood',
            jobTitle: 'Evangelist of Roger Enriquez'
        },
        {
            name: 'Kerry Bowley',
            jobTitle: 'Dev Mom'
        },
    ];
});
