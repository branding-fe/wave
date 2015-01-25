/***************************************************************************
 *
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$
 *
 * @file:    src/wave.js
 * @author:  songao(songao@baidu.com)
 * @version: $Revision$
 * @date:    $Date: 2014/08/25 08:34:27$
 * @desc:    all kinds of timing function
 *
 **************************************************************************/

/* eslint-disable dot-notation */

define(function (require) {
    var Bezier = require('./Bezier');

    var Easings = {
        /**
         * linear easing function.
         * @param {number} p percent
         * @return {number} new percent value.
         */
        'linear': function (p) {
            return p;
        },

        /**
         * no animation.
         * @param {number} p percent
         * @return {number} new percent value.
         */
        'none': function (p) {
            return 0;
        },

        /**
         * no animation and enter the end statue immediately.
         * @param {number} p percent
         * @return {number} new percent value.
         */
        'full': function (p) {
            return 1;
        },

        /**
         * reverse animation.
         * @param {number} p percent
         * @return {number} new percent value.
         */
        'reverse': function (p) {
            return 1 - p;
        },

        /**
         * jquery swing easing function.
         * https://github.com/jquery/jquery/blob/10399ddcf8a239acc27bdec9231b996b178224d3/src/effects/Tween.js#L106
         * @param {number} p percent
         * @return {number} new percent value.
         */
        'swing': function (p) {
            return 0.5 - Math.cos(p * Math.PI) / 2;
        },

        /**
         * spring easing
         * @param {number} p percent
         * @return {number};
         */
        'spring': function (p) {
            return 1 - (Math.cos(p * 4.5 * Math.PI) * Math.exp(-p * 6));
        }
    };

    // build easing using WaveFragment
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

    // build easing using Bezier
    var easingBezierMap = {
        /* CSS3预定义类型 */
        'ease': [0.25, 0.1, 0.25, 1.0],
        'ease-in': [0.42, 0.0, 1.00, 1.0],
        'ease-out': [0.00, 0.0, 0.58, 1.0],
        'ease-in-out': [0.42, 0.0, 0.58, 1.0]
        /* Robert Penner easing 函数 */
        /*
        'easeInSine': [0.47, 0, 0.745, 0.715],
        'easeOutSine': [0.39, 0.575, 0.565, 1],
        'easeInOutSine': [0.445, 0.05, 0.55, 0.95],
        'easeInQuad': [0.55, 0.085, 0.68, 0.53],
        'easeOutQuad': [0.25, 0.46, 0.45, 0.94],
        'easeInOutQuad': [0.455, 0.03, 0.515, 0.955],
        'easeInCubic': [0.55, 0.055, 0.675, 0.19],
        'easeOutCubic': [0.215, 0.61, 0.355, 1],
        'easeInOutCubic': [0.645, 0.045, 0.355, 1],
        'easeInQuart': [0.895, 0.03, 0.685, 0.22],
        'easeOutQuart': [0.165, 0.84, 0.44, 1],
        'easeInOutQuart': [0.77, 0, 0.175, 1],
        'easeInQuint': [0.755, 0.05, 0.855, 0.06],
        'easeOutQuint': [0.23, 1, 0.32, 1],
        'easeInOutQuint': [0.86, 0, 0.07, 1],
        'easeInExpo': [0.95, 0.05, 0.795, 0.035],
        'easeOutExpo': [0.19, 1, 0.22, 1],
        'easeInOutExpo': [1, 0, 0, 1],
        'easeInCirc': [0.6, 0.04, 0.98, 0.335],
        'easeOutCirc': [0.075, 0.82, 0.165, 1],
        'easeInOutCirc': [0.785, 0.135, 0.15, 0.86]
        */
    };
    for (name in easingBezierMap) {
        if (easingBezierMap.hasOwnProperty(name)) {
            Easings[name] = new Bezier(easingBezierMap[name]).getEasing();
        }
    }

    /**
     * wave generator
     * @constructor
     * @param {Function|string|Array.<number>} value Easing name or bezier points
     * @return {?Function}
     */
    function Wave(value) {
        if (!(this instanceof Wave)) {
            return Wave.make(value);
        }

        /**
         * wave input
         * @type {*}
         */
        this.value = value;

        /**
         * the easing function
         * @type {Function}
         */
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
        }
        else if (Object.prototype.toString.call(value) === '[object Array]') {
            return new Bezier(value).getEasing();
        }
        else if (Object.prototype.toString.call(value) === '[object Function]') {
            return /** @type {Function} */(value);
        }
        return null;
    };

    /**
     * register a wave
     * @param {string} name wave name
     * @param {Function|string|Array.<number>} value Wave function or something to generate one
     */
    Wave.register = function (name, value) {
        var easing = new Wave(value).getEasing();
        if (easing) {
            Easings[name] = easing;
        }
        else {
            throw 'unregisterable';
        }
    };

    /**
     * get the map of all wave
     * @return {Object.<string, Function>};
     */
    Wave.getMap = function () {
        return Easings;
    };

    return Wave;
});



















/* vim: set ts=4 sw=4 sts=4 tw=100 : */
