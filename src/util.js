/***************************************************************************
 *
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$
 * @author:  zmmbreeze(zmmbreeze0825@gmail.com), songao(songao@baidu.com)
 * @file:    src/util.js
 *
 **************************************************************************/


/*
 * path:    src/util.js
 * desc:    all kinds of timing function
 * author:  zmmbreeze(zmmbreeze0825@gmail.com), songao(songao@baidu.com)
 * version: $Revision$
 * date:    $Date: 2014/08/25 08:34:27$
 */


define(function (require) {
    return {
        /**
         * repeat easing function.
         * @param {function(number)} easing input easing function
         * @param {number} repeatCount repeat count.
         * @return {function(number)} new easing function
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
         * @param {function(number)} easing input easing function
         * @return {function(number)} new easing function
         */
        reverse: function (easing) {
            return function (p) {
                return 1 - easing(1 - p);
            };
        },
        /**
         * reflect easing function.
         * @param {function(number)} easing input easing function
         * @return {function(number)} new easing function
         */
        reflect: function (easing) {
            return function (p) {
                return 0.5 * (p < 0.5 ? easing(2 * p) : (2 - easing(2 - 2 * p)));
            };
        }
    };
});
