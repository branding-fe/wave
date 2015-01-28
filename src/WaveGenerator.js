/***************************************************************************
 *
 * Copyright (c) 2015 Baidu.com, Inc. All Rights Reserved
 * $Id$
 *
 * @file src/WaveGenerator.js
 * @author:  songao(songao@baidu.com)
 * @version: $Revision$
 * @date:    $Date: 2015/01/28 21:53:42$
 * @desc:    非常规波形
 *
 **************************************************************************/


define(function (require) {
    return {
        /**
         * 生成加速波形
         * @param {number} a 加速度
         * @return {Function}
         */
        'Acceleration': function (a) {
            /**
             * 加速波形
             * @param {number} p 进度百分比
             * @return {number}
             */
            return function (p) {
                return (2 - a + a * p) * p / 2;
            };
        }
    };
});




















/* vim: set ts=4 sw=4 sts=4 tw=100 : */
