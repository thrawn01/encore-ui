/*jshint node:true*/

exports.rxFloatingHeader = {

    scrollToElement: function (elem) {
        return elem.getLocation().then(function (loc) {
            var command = ['window.scrollTo(0, ', loc.y.toString(), ');'].join('');
            browser.executeScript(command);
        });
    },

    compareYLocations: function (e1, e2) {
        return this.compareLocations(e1, e2, 'y');
    },

    compareXLocations: function (e1, e2) {
        return this.compareLocations(e1, e2, 'x');
    },

    // Unify input from either a location object or a web element into a promise
    // representing the location attribute (x or y) of either input.
    // Both `transformLocation($('.element'), 'y')` and `transformLocation({x: 20, y: 0}, 'y')`
    // return a promise representing the y value of the resulting (or provided) location object.
    transformLocation: function (elementOrLocation, attribute) {
        if (protractor.promise.isPromise(elementOrLocation)) {
            var elem = elementOrLocation;
            return elem.getLocation().then(function (loc) {
                return loc[attribute];
            });
        } else {
            var location = elementOrLocation;
            if (location[attribute]) {
                return protractor.promise.fulfilled(location[attribute]);
            } else {
                return protractor.promise.fulfilled(location);
            }
        }
    },

    compareLocations: function (e1, e2, attribute) {
        attribute = attribute || 'y';
        var promises = [this.transformLocation(e1, attribute), this.transformLocation(e2, attribute)];
        return protractor.promise.all(promises).then(function (locations) {
            return locations[0] === locations[1];
        });
    }

};
