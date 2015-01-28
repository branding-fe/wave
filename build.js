/***************************************************************************
 *
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$
 *
 * @file:    build.js
 * @author:  songao(songao@baidu.com)
 * @version: $Revision$
 * date:    $Date: 2014/09/14 19:11:26$
 * @desc:    打包脚本
 *
 **************************************************************************/

/* eslint-env node */
/* eslint-disable camelcase */

var fs = require('fs');
var path = require('path');
var child_process = require('child_process');
var uglify = require('uglify-js');

var package = JSON.parse(fs.readFileSync(path.join(__dirname, '/package.json'), 'utf-8'));
function merge() {
    // type 1: amd module
    var amdCode = fs.readFileSync(path.join(__dirname, '/output/asset/Wave.js'), 'utf-8');
    var minifiedCode = uglify.minify(amdCode, {fromString: true});

    fs.writeFileSync(path.join(__dirname, '/dist/amd/wave-' + package.version + '.js'), amdCode);
    fs.writeFileSync(path.join(__dirname, '/dist/amd/wave.latest.js'), amdCode);
    fs.writeFileSync(path.join(__dirname, '/dist/amd/wave-' + package.version + '.min.js'), minifiedCode.code);
    fs.writeFileSync(path.join(__dirname, '/dist/amd/wave.latest.min.js'), minifiedCode.code);

    // type 2: output namespace in window
    var code = fs.readFileSync(path.join(__dirname, '/build/wrap/start.js'), 'utf-8')
        + fs.readFileSync(path.join(__dirname, '/build/wrap/almond.js'), 'utf-8')
        + amdCode
        + fs.readFileSync(path.join(__dirname, '/build/wrap/end.js'), 'utf-8');
    minifiedCode = uglify.minify(code, {fromString: true});

    fs.writeFileSync(path.join(__dirname, '/dist/wave-' + package.version + '.js'), code);
    fs.writeFileSync(path.join(__dirname, '/dist/wave.latest.js'), code);
    fs.writeFileSync(path.join(__dirname, '/dist/wave-' + package.version + '.min.js'), minifiedCode.code);
    fs.writeFileSync(path.join(__dirname, '/dist/wave.latest.min.js'), minifiedCode.code);
}

child_process.exec('node node_modules/edp/bin/edp-cli build -f', function (err, stdout, stderr) {
    if (err) {
        console.log(stderr);
    }
    console.log(stdout);
    console.log(stderr);
    merge();
});




















/* vim: set ts=4 sw=4 sts=4 tw=100 : */
