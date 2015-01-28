Wave
==========

The JavaScript animation timing function framework.

See the demo: http://branding-fe.github.io/wave/

## Usage

There is two ways to get a easing function

By name:

```javascript
var easing = wave('easeInCubic');
```

By bezier points:

```javascript
var easing = wave([0, 1]);
// or
var easing = wave([.54, .15, .42, .83]);
// or even more points
var easing = wave([.54, .15, .42, .83, ...]);
```

You can also register your own named easing function

```javascript
wave.register('fast-in', function(x) {
    return Math.min(1.2 * x, 1);
});
```
