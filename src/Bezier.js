/***************************************************************************
 * 
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$
 * 
 **************************************************************************/
 
 
/*
 * path:    src/Bezier.js
 * desc:    the bezier function
 * author:  songao(songao@baidu.com)
 * version: $Revision$
 * date:    $Date: 2014/08/23 19:59:31$
 */

define(function(require) {
    /**
     * 用于动画的贝塞尔函数JavaScript版：起点(0, 0), 终点(1, 1)
     * 支持任意阶贝塞尔函数
     * see http://greweb.me/2012/02/bezier-curve-based-easing-functions-from-concept-to-implementation/
     *
     * 使用方法：
     * var bezier = new Bezier(x1, y1, x2, y2, ...);
     * var y = bezier.get(x);
     *
     * @param {...*} var_args 贝塞尔曲线控制点(不包含起点和终点)
     */
    function Bezier(var_args) {
        var args = [].slice.call(arguments, 0);
        if (Object.prototype.toString.call(args[0]) === '[object Array]') {
            args = args[0];
        }
        if (args.length % 2) {
            throw 'coordinate count should be even.';
        }

        /**
         * @type {Array.<Object>}
         */
        this.points = [];

        for (var i = 0; i < args.length; i += 2) {
            this.points.push({
                x: args[i],
                y: args[i + 1]
            });
        }

        /**
         * @type {Array.<Object>}
         */
        this.actualPoints = this.points.slice(0);
        this.actualPoints.unshift({
            x: 0,
            y: 0
        });
        this.actualPoints.push({
            x: 1,
            y: 1
        });
        // TODO: validate args

        /**
         * 存储计算过的采样
         * @type {Object.<number, Array>}
         */
        this.sampleCache = {};

        /**
         * 存储计算过的阶乘
         * @type {Object.<number, number>}
         */
        this.factorialCache = {};

        /**
         * 阶数
         * @type {number}
         */
        this.order = this.actualPoints.length - 1;

        /**
         * 样条采样个数
         */
        this.splineSampleCount = 11;

        /**
         * 样条采样，用于粗略估计给定t之后x的大致位置
         * @type {Array.<Object>}
         */
        this.splineSamples = [];

        /**
         * 样条采样间隔
         * @type {number}
         */
        this.splineInterval = 1.0 / (this.splineSampleCount - 1);

        // 计算样条采样
        this.calcSplineSamples();
    }

    /**
     * 一些常量
     * @type {Object.<string, number>}
     */
    Bezier.const = {
        NEWTON_ITERATIONS: 4,
        NEWTON_MIN_SLOPE: 0.001,
        SUBDIVISION_PRECISION: 0.0000001,
        SUBDIVISION_MAX_ITERATIONS: 10
    };

    /**
     * 计算样条采样
     */
    Bezier.prototype.calcSplineSamples = function() {
        for (var i = 0; i < this.splineSampleCount; i++) {
            this.splineSamples[i] = this.getFromT(i * this.splineInterval);
        }
    };

    /**
     * 获取某个x对应的函数值
     */
    Bezier.prototype.get = function(x) {
        var guessT = this.getTFromX(x);
        return this.getFromT(guessT).y;
    };

    /**
     * 从x近似计算得到t
     * @param {number} x
     */
    Bezier.prototype.getTFromX = function(x) {
        var tStart = 0;
        var index = 0;
        for (var i = 1; i < this.splineSampleCount; i++) {
            if (i === this.splineSampleCount - 1 || this.splineSamples[i].x > x) {
                tStart = this.splineInterval * (i - 1);
                index = i - 1;
                break;
            }
        }
        var tPossible = tStart
            + this.splineInterval
                * (x - this.splineSamples[index].x)
                / (this.splineSamples[index + 1].x - this.splineSamples[index].x);
        // 计算斜率
        var derivative = this.getDerivativeFromT(tPossible);
        // 斜率较大时使用牛顿拉普生迭代逼近
        if (derivative.x >= Bezier.const.NEWTON_MIN_SLOPE) {
            return this.runNewtonRaphsonIterate(x, tPossible);
        }
        // 斜率为0，表示x对t不变，那么意味着这里贝塞尔曲线坡度很陡(即dy/dt或者dy/dx很大，为啥？因为曲线总归得
        // 随t增加长度吧...)，这里的t就是想要的
        else if (derivative.x == 0) {
            return tPossible;
        }
        // 斜率介于 0 ~ NEWTON_MIN_SLOPE 之间时采用二分法计算（不适合用牛顿拉普生迭代计算）
        else {
            return this.runBinarySubdivide(x, tStart, tStart + this.splineInterval);
        }
    };

    /**
     * 牛顿拉普生迭代计算t值
     */
    Bezier.prototype.runNewtonRaphsonIterate = function(x, tPossible) {
        for (var i = 0; i < Bezier.const.NEWTON_ITERATIONS; i++) {
            var derivative = this.getDerivativeFromT(tPossible);
            if (derivative.x == 0) {
                return tPossible;
            }
            else {
                var dx = this.getFromT(tPossible).x - x;
                tPossible -= dx / derivative.x;
            }
        }
        return tPossible;
    };

    /**
     * 二分法计算t值
     */
    Bezier.prototype.runBinarySubdivide = function(x, tStart, tEnd) {
        var tPossible;
        for (var i = 0; i < Bezier.const.SUBDIVISION_MAX_ITERATIONS; i++) {
            tPossible = tStart + (tEnd - tStart) / 2.0;
            dx = this.getFromT(tPossible).x - x;
            if (dx <= Bezier.const.SUBDIVISION_PRECISION) {
                return tPossible;
            }
            else if (dx > 0) {
                tEnd = tPossible;
            }
            else {
                tStart = tPossible;
            }
        }
        return tPossible;
    };

    /**
     * 获取某个t值对应的点
     * @param {number} t
     * @return {Object}
     */
    Bezier.prototype.getFromT = function(t) {
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

    /**
     * 获取贝塞尔函数的多项式格式的系数
     * see http://upload.wikimedia.org/math/e/9/7/e970f51b996903c7d470c0bcecd6f22e.png
     *     http://upload.wikimedia.org/math/8/3/8/83893d1f4494d4e2cc8e84284400b319.png
     */
    Bezier.prototype.getCoefficients = function() {
        if (this.coefficients) {
            return this.coefficients;
        }
        // 计算一遍之后缓存下来
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

    /**
     * 阶乘
     */
    Bezier.prototype.getFactorial = function(n) {
        if (this.factorialCache[n]) {
            return this.factorialCache[n];
        }
        if (n === 0) {
            return 1;
        }
        else {
            // 计算某个n值的阶乘之后缓存下来
            this.factorialCache[n] = n * this.getFactorial(n - 1);
            return this.factorialCache[n];
        }
    };

    /**
     * 获取指定t的导数
     */
    Bezier.prototype.getDerivativeFromT = function(t) {
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

    /**
     * 获取指定数目的按x的采样：直接用于动画
     */
    Bezier.prototype.getSamples = function(count) {
        if (this.sampleCache[count]) {
            return this.sampleCache[count];
        }
        var samples = [];
        for (var i = 0; i < count; i++) {
            samples.push(this.get(i / (count - 1)));
        }
        this.sampleCache[count] = samples;
    };

    /**
     * 获取easing function
     */
    Bezier.prototype.getEasing = function() {
        var me = this;

        return function(x) {
            return me.get(x);
        };
    };

    return Bezier;
});



















/* vim: set ts=4 sw=4 sts=4 tw=100 : */
