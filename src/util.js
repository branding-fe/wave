
/**
 * utils
 *
 * @type {Object.<string, Function>}
 */
wave.util = {
    /**
     * repeat easing function.
     * @param {function<number>} easing
     * @param {number} repeatCount
     * @return {function<number>} new easing function
     */
    repeat: function (easing, repeatCount) {
        var stepCount = repeatCount * 2 - 1;
        return function (p) {
            var tmp = p * stepCount;
            var curStep = Math.floor(tmp);      // get integer part
            var newP = tmp - curStep;           // get decimal part
            var result = easing(newP);

            if (curStep % 2) {
                // is odd
                result = 1 - result;
            }

            return result;
        };
    },
    /**
     * reverse easing function.
     * @param {function<number>} easing
     * @return {function<number>} new easing function
     */
    reverse: function (easing) {
        return function (p) {
            return 1 - easing(1 - p);
        };
    },
    /**
     * reflect easing function.
     * @param {function<number>} easing
     * @return {function<number>} new easing function
     */
    reflect: function (easing) {
        return function (p) {
            return 0.5 * (p < 0.5 ? easing(2 * p) : (2 - easing(2 - 2 * p)));
        };
    }
};
