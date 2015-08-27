[![unstable](http://badges.github.io/stability-badges/dist/unstable.svg)](http://github.com/badges/stability-badges)

Component built to gather and send user feedback

## Default Submission Function

The `rxFeedback` component sends feedback to `/api/encore/feedback`, which routes feedback to `encoreui@lists`.
For the **Feedback Type** of "Feature Request", we will open up a new window redirecting the user to the **GET Feedback** website, which will now host all internal requests for features.

This endpoint also supports a `product` parameter `/api/encore/feedback/:product` for sending feedback to a
product-specific mailing list.

Adding a custom endpoint is managed in `encore-service-pillar`. Once configured
you can override the default endpoint with `rxFeedbackSvc.setEndpoint`.

```javascript
    // To be put in the run section of your application
    .run(function (rxFeedbackSvc) {
        rxFeedbackSvc.setEndpoint('/api/encore/feedback/cloud');
    });
```

## Custom Submission Function

The `rxFeedback` component allows you to define an `on-submit` attribute that points to a custom function for the
purposes of overriding the default submission logic.  This function should accept a single argument for a
feedback object with the following definition:

```javascript
// feedback object structure
{
  "type": {
    "label": "(string)",
    "placeholder": "(string) placeholder text",
    "prompt": "(string) UI text used to describe the `description` field"
  },
  "description": "(string) user-submitted feedback"
}
```

## UserVoice Redirect Integration

### Development
For development purposes, you may want to include one of the two following configurations depending on which type of project you have:

*The latest version of the [Encore generator](https://github.com/rackerlabs/generator-encore) will include this proxy*

**Gulp**: `gulp/util/prism.js`
```javascript
prism.create({
    name: 'encorefeedback',
    context: '/encore/feedback',
    host: 'staging.encore.rackspace.com',
    port: 443,
    https: true,
    changeOrigin: false
});
```

**Grunt**: `tasks/util/config`
```javascript
{
    context: '/encore/feedback',
    host: 'staging.encore.rackspace.com',
    port: 443,
    https: true,
    protocol: 'https',
    changeOrigin: false
}
```

### Production
To manually include the Feedback changes without updating your version of Encore UI, please include the following:

Include the following file in your `index.html` (after Encore UI or after injected dependencies):

[http://3bea8551c95f45baa125-a22eac1892b2a6dcfdb36104c0e925de.r46.cf1.rackcdn.com/feedback-override.js](http://3bea8551c95f45baa125-a22eac1892b2a6dcfdb36104c0e925de.r46.cf1.rackcdn.com/feedback-override.js)

```javascript
<!-- inject:js -->
<!-- endinject -->
<!-- or -->
<script src="bower_components/encore-ui/encore-ui-tpls.min.js"></script>
<script src="bower_components/encore-ui-svcs/dist/encore-ui-svcs.js"></script>
<!-- ... -->
<script src="https://6618f7541d71c1a404be-a22eac1892b2a6dcfdb36104c0e925de.ssl.cf1.rackcdn.com/feedback-override.js"></script>
```

-- OR --

Include in your `app.js` is the following snippet:

```javascript
// jscs:disable
// jshint ignore:start
angular.module('encore.ui.rxFeedback').factory("UserVoiceMapping",["$http","$location","$interval","$window",function(a,b,c,d){var e,f,g="https://get.feedback.rackspace.com/forums/297396",h="category",i=["Feature Request"],j=function(){var a=b.absUrl();return a="/"+a.split("/").slice(3).join("/"),a=a.slice(0,a.length-b.url().length)},k=function(){return e||(e=a({url:"/encore/feedback/route-map.json",cache:!0}).then(function(a){return a.data},function(){return{}})),e},l=function(a){var b=a.base||g,c=j();return _.has(a,c)&&(_.contains(a[c],"http")?b=a[c]:b+="/"+(a.categoryPrefix||h)+"/"+a[c]),b},m=function(){f&&(c.cancel(f),f=void 0)},n=function(a,b){return m(),a.loadingUserVoice=!0,f=c(function(){d.open(b,"_blank")},3e3,1,!1),f["finally"](function(){a.loadingUserVoice=!1}),b};return{cancelOpen:m,watch:function(a,b,c){c.showRedirectMessage=!1,m(),k(),a&&_.contains(i,a.label)&&(c.showRedirectMessage=!0,k().then(l).then(_.partial(n,c)).then(function(a){c.route=a}))}}}]);
angular.module("templates/feedbackForm.html", []).run(["$templateCache", function(a) { a.put("templates/feedbackForm.html", '<rx-modal-form rx-form title="Submit Feedback" subtitle="for page: {{ currentUrl }}" submit-text="Send Feedback" class="rx-feedback-form"><rx-form-section><rx-field><rx-field-name>Report Type:</rx-field-name><rx-field-content><rx-input><select rx-select id="selFeedbackType" ng-model="fields.type" ng-options="opt as opt.label for opt in feedbackTypes" ng-init="fields.type = feedbackTypes[0]" required></select></rx-input></rx-field-content></rx-field></rx-form-section><rx-form-section ng-show="fields.type" ng-if="!showRedirectMessage"><rx-field><rx-field-name class="feedback-description">{{fields.type.prompt}}:</rx-field-name><rx-field-content><rx-input><textarea rows="8" placeholder="{{fields.type.placeholder}}" required ng-model="fields.description" class="feedback-textarea"></textarea></rx-input></rx-field-content></rx-field></rx-form-section><div ng-if="showRedirectMessage"><div class="redirect-description well centered"><h2 class="title subdued">We want to hear your voice!</h2>*You will now be redirected to a new window.*<br><a href="{{ route }}" target="_blank">{{ route }}</a> <button class="title button cancel xs" ng-if="loadingUserVoice" ng-click="cancelOpen()">Cancel Redirect</button></div></div></rx-modal-form>')}])
angular.module("templates/rxFeedback.html", []).run(["$templateCache", function(a) { a.put("templates/rxFeedback.html", '<div class="rx-feedback"><rx-modal-action pre-hook="setCurrentUrl(this)" post-hook="sendFeedback(fields)" template-url="templates/feedbackForm.html">Submit Feedback</rx-modal-action></div>')}])
// jshint ignore:end
// jscs:enable

```

and in the `.config` section of your `app.js`:

```javascript
   .config(function($provide) {
      $provide.decorator('rxFeedbackDirective', function ($delegate, UserVoiceMapping) {
            var directive = $delegate[0];

            var link = directive.link;

            directive.compile = function () {
                return function (scope) {
                    link.apply(this, arguments);
                    var setCurrentUrl = scope.setCurrentUrl || function () {};
                    scope.cancelOpen = UserVoiceMapping.cancelOpen;
                    scope.setCurrentUrl = function (modalScope) {
                        setCurrentUrl(modalScope);
                        modalScope.$watch('fields.type', UserVoiceMapping.watch);
                    };
                };
            };
            return $delegate;
        });
    });

```