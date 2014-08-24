
/**
 * easing functions.
 *
 * percent = 1 - ((remaing / duration) || 0)
 *
 * @type {Object.<string, function.<number>>}
 */
wave.easing = {
    /**
     * linear easing function.
     * @param {number} percent
     * @return {number} new percent value.
     */
    linear: function (p) {
        return p;
    },
    /**
     * no animation.
     * @param {number} percent
     * @return {number} new percent value.
     */
    none: function (p) {
        return 0;
    },
    /**
     * no animation and enter the end statue immediately.
     * @param {number} percent
     * @return {number} new percent value.
     */
    full: function (p) {
        return 1;
    },
    /**
     * reverse animation.
     * @param {number} percent
     * @return {number} new percent value.
     */
    reverse: function (p) {
        return 1 - p;
    },
    /**
     * jquery swing easing function.
     * https://github.com/jquery/jquery/blob/10399ddcf8a239acc27bdec9231b996b178224d3/src/effects/Tween.js#L106
     * @param {number} percent
     * @return {number} new percent value.
     */
    swing: function (p) {
        return 0.5 - Math.cos(p * Math.PI) / 2;
    }
};

var basicEasing = {
    /**
     * Math.pow(p, 2).
     * http://jsperf.com/math-pow-vs-simple-multiplication
     * @param {number} percent
     * @return {number} new percent value.
     */
    Quad: function (p) {
        return p * p;
    },
    /**
     * Math.pow(p, 3).
     * @param {number} percent
     * @return {number} new percent value.
     */
    Cubic: function (p) {
        return p * p * p;
    },
    /**
     * Math.pow(p, 4).
     * @param {number} percent
     * @return {number} new percent value.
     */
    Quart: function (p) {
        return p * p * p * p;
    },
    /**
     * Math.pow(p, 5).
     * @param {number} percent
     * @return {number} new percent value.
     */
    Qunit: function (p) {
        return p * p * p * p * p;
    },
    /**
     * Math.pow(p, 6).
     * @param {number} percent
     * @return {number} new percent value.
     */
    Expo: function (p) {
        return p * p * p * p * p * p;
    },
    /**
     * Sine wave.
     * @param {number} percent
     * @return {number} new percent value.
     */
    Sine: function (p) {
        return 1 - Math.cos(p * Math.PI / 2);
    },
    /**
     * 1/4 circle.
     * @param {number} percent
     * @return {number} new percent value.
     */
    Circ: function (p) {
        return 1 - Math.sqrt(1 - p * p);
    },
    /**
     * come back a little then return.
     * @param {number} percent
     * @return {number} new percent value.
     */
    Back: function (p) {
        return p * p * (3 * p - 2);
    },
    /**
     * Elastic
     * @param {number} percent
     * @return {number} new percent value.
     */
    Elastic: function (p) {
        return p === 0 || p === 1 ? p :
            -Math.pow(2, 8 * (p - 1)) * Math.sin(((p - 1) * 80 - 7.5) * Math.PI / 15);
    },
    /**
     * Bounce effect: like a ball.
     * @param {number} percent
     * @return {number} new percent value.
     */
    Bounce: function (p) {
        var pow2;
        var bounce = 4;

        while (p < ((pow2 = Math.pow(2, --bounce)) - 1) / 11) {}
        return 1 / Math.pow(4, 3 - bounce) - 7.5625 * Math.pow((pow2 * 3 - 2) / 22 - p, 2);
    }
};

for (var name in basicEasing) {
    wave.easing['easeIn' + name] = basicEasing[name];
    wave.easing['easeOut' + name] = wave.util.reverse(basicEasing[name]);
    wave.easing['easeInOut' + name] = wave.util.reflect(basicEasing[name]);
    wave.easing['easeOutIn' + name] = wave.util.reflect(wave.util.reverse(basicEasing[name]));
}
