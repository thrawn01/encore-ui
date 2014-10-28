/*jshint unused:false*/
angular.module('demoApp').controller('hotkeysCtrl', function ($scope, hotkeys) {
    $scope.volume = 5;

    hotkeys.add({
        combo: 'ctrl+up',
        description: 'Turn up the volume!',
        callback: function () {
            $scope.volume += 1;
        }
    });

    hotkeys.add({
        combo: 'ctrl+down',
        description: 'Turn it down!',
        callback: function () {
            $scope.volume -= 1;
        }
    });

    var showHFSHE = function () {
        var videoSrc = '//www.youtube.com/embed/Dach1nPbsY8?autoplay=1';

        var iframe = document.createElement('iframe');
        iframe.src = videoSrc;

        var container = document.getElementById('hfshe');
        container.appendChild(iframe);
        container.style.display = 'block';
    };

    hotkeys.add({
        combo: 'up+up+down+down+left+right+left+right+a+b',
        callback: showHFSHE
    });
});
