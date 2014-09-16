exports.input = __dirname;

var path = require( 'path' );
// var FileInfo = require( 'edp-build/lib/file-info' );
exports.output = path.resolve( __dirname, 'output' );

var moduleEntries = 'html,htm,phtml,tpl,vm,js';
var pageEntries = 'html,htm,phtml,tpl,vm';

// var gccModuleProcessor = {
//     name: 'gccmodule',
//     files: ['*.js'],
//     process: function(file, processContext, callback) {
//         var gccModName = 'brandingfe.' + file.path.split('/').join('.');
//         var fileData = new FileInfo({
//             data         : [
//                 'goog.provide(\'' + gccModName + '\');\n\n',
//                 '(function() {\n',
//                 '    function define(modName, factory) {\n',
//                 '        ' + gccModName + '[modName] = factory();\n',
//                 '    }\n',
//                 file.data,
//                 '})();'
//             ].join(''),
//             extname      : file.extname,
//             path         : file.path.replace(/\.js$/, '.gcc.js'),
//             fullPath     : file.fullPath.replace(/\.js$/, '.gcc.js'),
//             stat         : file.stat,
//             fileEncoding : file.fileEncoding
//         });
//         processContext.addFile(fileData);
// 
//         callback();
//     }
// };

exports.getProcessors = function () {
    return [
        new LessCompiler( {
            entryExtnames: pageEntries
        } ),
        new ModuleCompiler( {
            configFile: 'module.conf',
            entryExtnames: moduleEntries
        } ),
        // new JsCompressor(),
        // gccModuleProcessor,
        new PathMapper( {
            replacements: [
                { type: 'html', tag: 'link', attribute: 'href', extnames: pageEntries },
                { type: 'html', tag: 'img', attribute: 'src', extnames: pageEntries },
                { type: 'html', tag: 'script', attribute: 'src', extnames: pageEntries },
                { extnames: moduleEntries, replacer: 'module-config' },
                { extnames: 'css,less', replacer: 'css' }
            ],
            from: 'src',
            to: 'asset'
        } ) 
    ];
};

exports.exclude = [
    '/tool',
    '/doc',
    '/test',
    '/assets',
    '/module.conf',
    '/dep/packages.manifest',
    '/dep/*/*/test',
    '/dep/*/*/doc',
    '/dep/*/*/demo',
    '/dep/*/*/tool',
    '/dep/*/*/*.md',
    '/dep/*/*/package.json',
    '/edp-*',
    'node_modules',
    '/.edpproj',
    '.svn',
    '.git',
    '.gitignore',
    '.idea',
    '.project',
    'Desktop.ini',
    'Thumbs.db',
    '.DS_Store',
    '*.tmp',
    '*.bak',
    '*.swp'
];

exports.injectProcessor = function ( processors ) {
    for ( var key in processors ) {
        global[ key ] = processors[ key ];
    }
};

