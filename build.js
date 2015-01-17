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
    var code = fs.readFileSync(__dirname + '/build/wrap/start.js', 'utf-8')
        + fs.readFileSync(__dirname + '/build/wrap/almond.js', 'utf-8')
        + fs.readFileSync(__dirname + '/output/asset/Wave.js', 'utf-8')
        + fs.readFileSync(__dirname + '/build/wrap/end.js', 'utf-8');

    var minified = uglify.minify(code, {fromString: true});

    fs.writeFileSync(__dirname + '/dist/wave-' + package.version + '.js', code);
    fs.writeFileSync(__dirname + '/dist/wave.latest.js', code);
    fs.writeFileSync(__dirname + '/dist/wave-' + package.version + '.min.js', minified.code);
    fs.writeFileSync(__dirname + '/dist/wave.latest.min.js', minified.code);
}

child_process.exec('node node_modules/edp/bin/edp-cli build -f', function(err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    merge();
});




















/* vim: set ts=4 sw=4 sts=4 tw=100 : */
