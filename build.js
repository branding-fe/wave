/***************************************************************************
 * 
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$
 * 
 **************************************************************************/
 
 
/*
 * path:    build.js
 * desc:    
 * author:  songao(songao@baidu.com)
 * version: $Revision$
 * date:    $Date: 2014/09/14 19:11:26$
 */

var fs = require('fs');
var child_process = require('child_process');
var uglify = require('uglify-js');

var package = JSON.parse(fs.readFileSync(__dirname + '/package.json', 'utf-8'));
function merge() {
    // type 1: amd module
    var amdCode = fs.readFileSync(__dirname + '/output/asset/Wave.js', 'utf-8')
    var minifiedCode = uglify.minify(amdCode, { fromString: true });

    fs.writeFileSync(__dirname + '/dist/amd/wave-' + package.version + '.js', amdCode);
    fs.writeFileSync(__dirname + '/dist/amd/wave.latest.js', amdCode);
    fs.writeFileSync(__dirname + '/dist/amd/wave-' + package.version + '.min.js', minifiedCode.code);
    fs.writeFileSync(__dirname + '/dist/amd/wave.latest.min.js', minifiedCode.code);

    // type 2: output namespace in window
    var code = fs.readFileSync(__dirname + '/build/wrap/start.js', 'utf-8')
        + fs.readFileSync(__dirname + '/build/wrap/almond.js', 'utf-8')
        + amdCode
        + fs.readFileSync(__dirname + '/build/wrap/end.js', 'utf-8');
    minifiedCode = uglify.minify(code, { fromString: true });

    fs.writeFileSync(__dirname + '/dist/wave-' + package.version + '.js', code);
    fs.writeFileSync(__dirname + '/dist/wave.latest.js', code);
    fs.writeFileSync(__dirname + '/dist/wave-' + package.version + '.min.js', minifiedCode.code);
    fs.writeFileSync(__dirname + '/dist/wave.latest.min.js', minifiedCode.code);
}

child_process.exec('node node_modules/edp/bin/edp-cli build -f', function(err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    merge();
});




















/* vim: set ts=4 sw=4 sts=4 tw=100 : */
