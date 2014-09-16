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

var child_process = require('child_process');
child_process.exec('node node_modules/edp/lib/cli build -f', function(err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    clean();
});

var fs = require('fs');
var amdclean = require('amdclean');
function clean() {
    var code = fs.readFileSync(__dirname + '/output/asset/wave.js', 'utf-8');
    code = code.replace(/,define\(/g, ';define(');
    var cleanedCode = amdclean.clean({
        'code': code,
        'wrap': {
            'start': '',
            'end': ''
        }
    });
    fs.writeFileSync(
        __dirname + '/dist/wave.js',
        ';window.brandingfe = window.brandingfe || {};\n(function() {\n'
            + cleanedCode
            + 'window.brandingfe.wave = wave;\n})();\n'
    );

    fs.writeFileSync(
        __dirname + '/dist/wave.gcc.js',
        'goog.provide(\'brandingfe.wave\');\n(function() {\n'
            + cleanedCode
            + 'brandingfe.wave = wave;\n})();\n'
    );
}

clean();


















/* vim: set ts=4 sw=4 sts=4 tw=100 : */
