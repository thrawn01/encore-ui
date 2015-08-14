[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

An **element directive** used to apply predetetermined descriptions to an entity.

## Usage

Like native form components, this directive uses `ng-model` to store its value. The only other required attribute is `options` which accepts an array of available tags that can be applied.  The tags are objects, each with required `text` and `category` properties.  Any additional properties will be ignored.
```javascript
$scope.colorOptions = [
  {
    "text": "blue",
    "category": "color"
  }
  // ...
]
```

By default, the model value is a subset of the options, meaning an new array containing some of the same objects.  However, the `key` attribute can be used to customize the model binding by selecting a single value to represent the object, e.g.
```html
<rx-tags options="colorOptions" ng-model="colors" key="id"></rx-tags>
```

```javascript
$scope.colorOptions = [
  {
    "id": "tag0",
    "text": "blue",
    "category": "color"
  }
]

// $scope.colors === ["tag0"] when selected
```

This component can be disabled via the `disabled` attribute or `ng-disabled` directive.
