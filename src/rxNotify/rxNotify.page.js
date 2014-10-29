/*jshint node:true*/
var Page = require('astrolabe').Page;

var notificationTypes = /error|info|success|warning/;
var notification = function (rootElement) {

    return Page.create({

        rootElement: {
            get: function () {
                return rootElement;
            }
        },

        btnDismiss: {
            get: function () {
                return rootElement.$('.notification-dismiss');
            }
        },

        type: {
            get: function () {
                return rootElement.getAttribute('class').then(function (className) {
                    return className.match(notificationTypes)[0];
                });
            }
        },

        text: {
            get: function () {
                return rootElement.getText().then(function (text) {
                    // Remove any lingering '× ' characters.
                    return text.split('\n')[0].trim();
                });
            }
        },

        dismiss: {
            value: function () {
                var page = this;
                return this.isDismissable().then(function (dismissable) {
                    if (dismissable) {
                        page.btnDismiss.click();
                    }
                });
            }
        },

        hasSpinner: {
            value: function () {
                return rootElement.$('.rx-spinner').isPresent();
            }
        },

        isDismissable: {
            value: function () {
                return this.btnDismiss.isPresent();
            }
        }

    });

};

var rxNotify = {

    tblNotifications: {
        get: function () {
            return this.rootElement.all(by.repeater('message in messages'));
        }
    },

    count: {
        value: function () {
            return this.tblNotifications.count();
        }
    },

    messages: {
        get: function () {
            return this.tblNotifications.map(function (notificationElement) {
                return notification(notificationElement);
            });
        }
    },

    byType: {
        value: function (notificationType) {
            // This version of the code returns an invalid array.
            var css = '.notification-' + notificationType.toLowerCase();
            return this.rootElement.$$(css).map(function (notificationElement) {
                return notification(notificationElement);
            });
        }
    },

    dismiss: {
        value: function () {
            var page = this;
            return this.tblNotifications.each(function () {
                notification(page.tblNotifications.get(-1)).dismiss();
            });
        }
    },

    exists: {
        value: function (string, type) {
            var elementsOfType;

            type = type ? '.notification-'.concat(type) : '*';
            elementsOfType = this.rootElement.all(by.cssContainingText(type, string));

            return elementsOfType.count().then(function (count) {
                return count > 0;
            });
        }
    }

};

exports.rxNotify = {

    initialize: function (rxNotification) {
        return notification(rxNotification);
    },

    byStack: function (stackName) {
        rxNotify.rootElement = {
            get: function () {
                return $('.rx-notifications[stack="' + stackName + '"]');
            }
        };

        return Page.create(rxNotify);
    },

    all: (function () {
        rxNotify.rootElement = {
            get: function () {
                return $('html');
            }
        };

        return Page.create(rxNotify);
    })()

};
