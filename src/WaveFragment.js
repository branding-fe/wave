/***************************************************************************
 * 
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$
 * 
 **************************************************************************/
 
 
/*
 * path:    src/WaveFragment.js
 * desc:    Wave Fragments
 * author:  zmmbreeze(zmmbreeze0825@gmail.com), songao(songao@baidu.com)
 * version: $Revision$
 * date:    $Date: 2014/08/25 12:23:55$
 */

define(function(require) {
    var easeInCurves = {
        /**
         * Math.pow(p, 2).
         * http://jsperf.com/math-pow-vs-simple-multiplication
         * @param {number} percent
         * @return {number} new percent value.
         */
        'Quad': function (p) {
            return p * p;
        },
        /**
         * Math.pow(p, 3).
         * @param {number} percent
         * @return {number} new percent value.
         */
        'Cubic': function (p) {
            return p * p * p;
        },
        /**
         * Math.pow(p, 4).
         * @param {number} percent
         * @return {number} new percent value.
         */
        'Quart': function (p) {
            return p * p * p * p;
        },
        /**
         * Math.pow(p, 5).
         * @param {number} percent
         * @return {number} new percent value.
         */
        'Qunit': function (p) {
            return p * p * p * p * p;
        },
        /**
         * Math.pow(p, 6).
         * @param {number} percent
         * @return {number} new percent value.
         */
        'Expo': function (p) {
            return p * p * p * p * p * p;
        },
        /**
         * Sine wave.
         * @param {number} percent
         * @return {number} new percent value.
         */
        'Sine': function (p) {
            return 1 - Math.cos(p * Math.PI / 2);
        },
        /**
         * 1/4 circle.
         * @param {number} percent
         * @return {number} new percent value.
         */
        'Circ': function (p) {
            return 1 - Math.sqrt(1 - p * p);
        },
        /**
         * come back a little then return.
         * @param {number} percent
         * @return {number} new percent value.
         */
        'Back': function (p) {
            return p * p * (3 * p - 2);
        },
        /**
         * Elastic
         * @param {number} percent
         * @return {number} new percent value.
         */
        'Elastic': function (p) {
            return p === 0 || p === 1 ? p :
                -Math.pow(2, 8 * (p - 1)) * Math.sin(((p - 1) * 80 - 7.5) * Math.PI / 15);
        },
        /**
         * Bounce effect: like a ball.
         * @param {number} percent
         * @return {number} new percent value.
         */
        'Bounce': function (p) {
            var pow2;
            var bounce = 4;

            while (p < ((pow2 = Math.pow(2, --bounce)) - 1) / 11) {}
            return 1 / Math.pow(4, 3 - bounce) - 7.5625 * Math.pow((pow2 * 3 - 2) / 22 - p, 2);
        }
    };

    var Bezier = require('./Bezier');
    var fastInCurves = {
        'B2ToLinear': (function() {
            var easing = new Bezier(0, 0.4, 0.2, 0.4, 0.4, 0.55).getEasing();
            return function(p) {
                return easing(p);
            }
        })()
    };

    return {
        'easeInCurves': easeInCurves,
        'fastInCurves': fastInCurves
    };
});



















/* vim: set ts=4 sw=4 sts=4 tw=100 : */
