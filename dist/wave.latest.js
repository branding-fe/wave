(function(_global){
/**
 * almond 0.2.5 Copyright (c) 2011-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);

                name = baseParts.concat(name.split("/"));

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (typeof callback === 'function') {

            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback.apply(defined[name], args);

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        config = cfg;
        if (config.deps) {
            req(config.deps, config.callback);
        }
        return req;
    };

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());
define('Bezier', ['require'], function (require) {
    function Bezier(varArgs) {
        var args = [].slice.call(arguments, 0);
        if (Object.prototype.toString.call(args[0]) === '[object Array]') {
            args = args[0];
        }
        if (args.length % 2) {
            throw 'coordinate count should be even.';
        }
        this.points = [];
        for (var i = 0; i < args.length; i += 2) {
            this.points.push({
                x: args[i],
                y: args[i + 1]
            });
        }
        this.actualPoints = this.points.slice(0);
        this.actualPoints.unshift({
            x: 0,
            y: 0
        });
        this.actualPoints.push({
            x: 1,
            y: 1
        });
        this.sampleCache = {};
        this.factorialCache = {};
        this.order = this.actualPoints.length - 1;
        this.splineSampleCount = 11;
        this.splineSamples = [];
        this.splineInterval = 1 / (this.splineSampleCount - 1);
        this.calcSplineSamples();
    }
    Bezier.consts = {
        NEWTON_ITERATIONS: 4,
        NEWTON_MIN_SLOPE: 0.001,
        SUBDIVISION_PRECISION: 1e-7,
        SUBDIVISION_MAX_ITERATIONS: 10
    };
    Bezier.prototype.calcSplineSamples = function () {
        for (var i = 0; i < this.splineSampleCount; i++) {
            this.splineSamples[i] = this.getFromT(i * this.splineInterval);
        }
    };
    Bezier.prototype.get = function (x) {
        var guessT = this.getTFromX(x);
        return this.getFromT(guessT).y;
    };
    Bezier.prototype.getTFromX = function (x) {
        var tStart = 0;
        var index = 0;
        for (var i = 1; i < this.splineSampleCount; i++) {
            if (i === this.splineSampleCount - 1 || this.splineSamples[i].x > x) {
                tStart = this.splineInterval * (i - 1);
                index = i - 1;
                break;
            }
        }
        var tPossible = tStart + this.splineInterval * (x - this.splineSamples[index].x) / (this.splineSamples[index + 1].x - this.splineSamples[index].x);
        var derivative = this.getDerivativeFromT(tPossible);
        if (derivative.x >= Bezier.consts.NEWTON_MIN_SLOPE) {
            return this.runNewtonRaphsonIterate(x, tPossible);
        } else if (derivative.x === 0) {
            return tPossible;
        }
        return this.runBinarySubdivide(x, tStart, tStart + this.splineInterval);
    };
    Bezier.prototype.runNewtonRaphsonIterate = function (x, tPossible) {
        for (var i = 0; i < Bezier.consts.NEWTON_ITERATIONS; i++) {
            var derivative = this.getDerivativeFromT(tPossible);
            if (derivative.x === 0) {
                return tPossible;
            }
            var dx = this.getFromT(tPossible).x - x;
            tPossible -= dx / derivative.x;
        }
        return tPossible;
    };
    Bezier.prototype.runBinarySubdivide = function (x, tStart, tEnd) {
        var tPossible;
        for (var i = 0; i < Bezier.consts.SUBDIVISION_MAX_ITERATIONS; i++) {
            tPossible = tStart + (tEnd - tStart) / 2;
            var dx = this.getFromT(tPossible).x - x;
            if (dx <= Bezier.consts.SUBDIVISION_PRECISION) {
                return tPossible;
            } else if (dx > 0) {
                tEnd = tPossible;
            } else {
                tStart = tPossible;
            }
        }
        return tPossible;
    };
    Bezier.prototype.getFromT = function (t) {
        var coeffs = this.getCoefficients();
        var x = 0;
        var y = 0;
        var n = this.order;
        for (var j = 0; j <= n; j++) {
            x += coeffs[j].x * Math.pow(t, j);
            y += coeffs[j].y * Math.pow(t, j);
        }
        return {
            x: x,
            y: y
        };
    };
    Bezier.prototype.getCoefficients = function () {
        if (this.coefficients) {
            return this.coefficients;
        }
        var n = this.order;
        this.coefficients = [];
        for (var j = 0; j <= n; j++) {
            var xsum = 0;
            var ysum = 0;
            for (var i = 0; i <= j; i++) {
                var pcoeff = Math.pow(-1, i + j) / (this.getFactorial(i) * this.getFactorial(j - i));
                xsum += pcoeff * this.actualPoints[i].x;
                ysum += pcoeff * this.actualPoints[i].y;
            }
            var ccoeff = this.getFactorial(n) / this.getFactorial(n - j);
            this.coefficients.push({
                x: ccoeff * xsum,
                y: ccoeff * ysum
            });
        }
        return this.coefficients;
    };
    Bezier.prototype.getFactorial = function (n) {
        if (this.factorialCache[n]) {
            return this.factorialCache[n];
        }
        if (n === 0) {
            return 1;
        }
        this.factorialCache[n] = n * this.getFactorial(n - 1);
        return this.factorialCache[n];
    };
    Bezier.prototype.getDerivativeFromT = function (t) {
        var coeffs = this.getCoefficients();
        var x = 0;
        var y = 0;
        var n = this.order;
        for (var j = 1; j <= n; j++) {
            x += j * coeffs[j].x * Math.pow(t, j - 1);
            y += j * coeffs[j].y * Math.pow(t, j - 1);
        }
        return {
            x: x,
            y: y
        };
    };
    Bezier.prototype.getSamples = function (count) {
        var samples = [];
        if (!this.sampleCache[count]) {
            for (var i = 0; i < count; i++) {
                samples.push(this.get(i / (count - 1)));
            }
            this.sampleCache[count] = samples;
        }
        return this.sampleCache[count];
    };
    Bezier.prototype.getEasing = function () {
        var me = this;
        return function (x) {
            return me.get(x);
        };
    };
    return Bezier;
});

define('WaveFragment', [
    'require',
    './Bezier'
], function (require) {
    var easeInCurves = {
            'Quad': function (p) {
                return p * p;
            },
            'Cubic': function (p) {
                return p * p * p;
            },
            'Quart': function (p) {
                return p * p * p * p;
            },
            'Qunit': function (p) {
                return p * p * p * p * p;
            },
            'Expo': function (p) {
                return p * p * p * p * p * p;
            },
            'Sine': function (p) {
                return 1 - Math.cos(p * Math.PI / 2);
            },
            'Circ': function (p) {
                return 1 - Math.sqrt(1 - p * p);
            },
            'Back': function (p) {
                return p * p * (3 * p - 2);
            },
            'Elastic': function (p) {
                return p === 0 || p === 1 ? p : -Math.pow(2, 8 * (p - 1)) * Math.sin(((p - 1) * 80 - 7.5) * Math.PI / 15);
            },
            'Bounce': function (p) {
                var pow2;
                var bounce = 4;
                while (p < ((pow2 = Math.pow(2, --bounce)) - 1) / 11) {
                }
                return 1 / Math.pow(4, 3 - bounce) - 7.5625 * Math.pow((pow2 * 3 - 2) / 22 - p, 2);
            }
        };
    var Bezier = require('./Bezier');
    var fastInCurves = { 'B2ToLinear': new Bezier(0, 0.4, 0.2, 0.4, 0.4, 0.55).getEasing() };
    return {
        'easeInCurves': easeInCurves,
        'fastInCurves': fastInCurves
    };
});

define('util', ['require'], function (require) {
    return {
        repeat: function (easing, repeatCount) {
            var stepCount = repeatCount * 2 - 1;
            return function (p) {
                var tmp = p * stepCount;
                var curStep = Math.floor(tmp);
                var newP = tmp - curStep;
                var result = easing(newP);
                if (curStep % 2) {
                    result = 1 - result;
                }
                return result;
            };
        },
        reverse: function (easing) {
            return function (p) {
                return 1 - easing(1 - p);
            };
        },
        reflect: function (easing) {
            return function (p) {
                return 0.5 * (p < 0.5 ? easing(2 * p) : 2 - easing(2 - 2 * p));
            };
        }
    };
});

define('Wave', [
    'require',
    './Bezier',
    './WaveFragment',
    './util'
], function (require) {
    var Bezier = require('./Bezier');
    var Easings = {
            'linear': function (p) {
                return p;
            },
            'none': function (p) {
                return 0;
            },
            'full': function (p) {
                return 1;
            },
            'reverse': function (p) {
                return 1 - p;
            },
            'swing': function (p) {
                return 0.5 - Math.cos(p * Math.PI) / 2;
            },
            'spring': function (p) {
                return 1 - Math.cos(p * 4.5 * Math.PI) * Math.exp(-p * 6);
            }
        };
    var WaveFragment = require('./WaveFragment');
    var util = require('./util');
    var easeInCurves = WaveFragment['easeInCurves'];
    var name;
    var fragment;
    for (name in easeInCurves) {
        if (easeInCurves.hasOwnProperty(name)) {
            fragment = easeInCurves[name];
            Easings['easeIn' + name] = fragment;
            Easings['easeOut' + name] = util.reverse(fragment);
            Easings['easeInOut' + name] = util.reflect(fragment);
            Easings['easeOutIn' + name] = util.reflect(util.reverse(fragment));
        }
    }
    var fastInCurves = WaveFragment['fastInCurves'];
    for (name in fastInCurves) {
        if (fastInCurves.hasOwnProperty(name)) {
            fragment = fastInCurves[name];
            Easings['fastIn' + name] = fragment;
            Easings['fastOut' + name] = util.reverse(fragment);
            Easings['fastInOut' + name] = util.reflect(fragment);
            Easings['fastOutIn' + name] = util.reflect(util.reverse(fragment));
        }
    }
    var easingBezierMap = {
            'ease': [
                0.25,
                0.1,
                0.25,
                1
            ],
            'ease-in': [
                0.42,
                0,
                1,
                1
            ],
            'ease-out': [
                0,
                0,
                0.58,
                1
            ],
            'ease-in-out': [
                0.42,
                0,
                0.58,
                1
            ]
        };
    for (name in easingBezierMap) {
        if (easingBezierMap.hasOwnProperty(name)) {
            Easings[name] = new Bezier(easingBezierMap[name]).getEasing();
        }
    }
    function Wave(value) {
        if (!(this instanceof Wave)) {
            return Wave.make(value);
        }
        this.value = value;
        this.easing;
    }
    Wave.prototype.getEasing = function () {
        if (!this.easing) {
            this.easing = Wave.make(this.value);
        }
        return this.easing;
    };
    Wave.make = function (value) {
        if (Object.prototype.toString.call(value) === '[object String]') {
            return Easings[value] || null;
        } else if (Object.prototype.toString.call(value) === '[object Array]') {
            return new Bezier(value).getEasing();
        } else if (Object.prototype.toString.call(value) === '[object Function]') {
            return value;
        }
        return null;
    };
    Wave.register = function (name, value) {
        var easing = new Wave(value).getEasing();
        if (easing) {
            Easings[name] = easing;
        } else {
            throw 'unregisterable';
        }
    };
    Wave.getMap = function () {
        return Easings;
    };
    return Wave;
});
var Wave = require('Wave');

_global['Wave'] = Wave;

})(window);
