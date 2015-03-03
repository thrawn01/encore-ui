/*jshint unused:false*/

// This file is used to help build the 'demo' documentation page and should be updated with example code
function rxPaginateCtrl ($scope, PageTracking) {
    $scope.sorter = {
        predicate: 'id',
        reverse: false
    };
    $scope.pager = PageTracking.createInstance({ itemsPerPage: 3 });

    var makeServers = function (serverCount) {
        var servers = [];
        var os = ['Ubuntu 12.04', 'Red Hat Enterprise Linux 6.4', 'CentOS 6.4', 'Ubuntu 13.04'];
        for (var i = 1; i < serverCount + 1; i++) {
            var server = {
                id: i,
                name: 'Server ' + i,
                os: os[i % os.length]
            };
            servers.push(server);
        }
        return servers;
    };

    $scope.servers = makeServers(21);

    $scope.removeServers = function () {
        if ($scope.servers.length > 2) {
            $scope.servers = $scope.servers.splice(2);
        }
    };

    $scope.addServers = function () {
        $scope.servers = $scope.servers.concat(makeServers(2));
    };
    
    var allLazyServers = makeServers(101);

    var serverInterface = {
        getItems: function (pageNumber, itemsPerPage) {
            var first = pageNumber * itemsPerPage;
            var added = first + itemsPerPage;
            var last = (added > allLazyServers.length) ? allLazyServers.length : added;

            first = first;
            last = last;

            $scope.lazyServers = allLazyServers.slice(first, last);
            $scope.lazyServers.totalNumberOfItems = allLazyServers.length;
        }
    };

    $scope.lazyPager = PageTracking.createInstance({}, serverInterface);
    serverInterface.getItems($scope.lazyPager.currentPage(), $scope.lazyPager.itemsPerPage);
}
