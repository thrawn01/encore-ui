/*jshint unused:false*/
angular.module('demoApp').controller('rxBreadcrumbsCtrl', function ($scope, rxBreadcrumbsSvc) {
    rxBreadcrumbsSvc.set([{
        path: '/',
        name: 'Components'
    }, {
        name: 'All Components'
    }]);
});
