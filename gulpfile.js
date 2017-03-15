// simply for beautiful loggings
const projectCaption = '@wulechuan/dom-stick-on-both-edges';


const pathForSourceFiles = 'source';
const pathForBuiltFiles = 'build';
const folderOfCssFiles = 'css';
const folderOfJsFiles = 'js';


let shouldMinifyJsFiles = false;
let shouldMinifyCssFiles = false;
let shouldStripConsoleLoggingsFromJsFiles = true;
let shouldGenerateMapFilesForJs = true;
let shouldGenerateMapFilesForCss = true;



const settingsForRemovingLoggingForJsFiles = {
    // namespace: [],
    methods: [
        // 'info',
        // 'error',
        // 'warn',
        'group',
        'groupEnd',
        'log',
        'debug'
    ]
};


const processArguments = require('minimist')(process.argv.slice(2));
const isToBuildForRelease =
    processArguments.release
    || processArguments.production
    || processArguments.ship
    || processArguments.final
    ;

const isToDevelopWithWatching = !isToBuildForRelease;

// production environment configurations
if (isToBuildForRelease) {
    shouldMinifyCssFiles = true;
    shouldMinifyJsFiles = true;
    shouldStripConsoleLoggingsFromJsFiles = true;
    shouldGenerateMapFilesForJs = false;
    shouldGenerateMapFilesForCss = false;
}








// import modules
const gulp = require('gulp');


// utilities
const pathTool = require('path');
const getJoinedPathFrom = pathTool.join;
const rename = require('gulp-rename');
const del = require('del');
const pump = require('pump');
const runTasksInSequnce = require('gulp-sequence');


// file content modifiers
const removeLogging = require('gulp-remove-logging');
const minifyCss = require('gulp-csso');
const uglifyJs = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');


// printing colorful logs in CLI
const logger = require('@wulechuan/colorful-log').createColorfulLogger(global.console, {
    prefix: projectCaption,
    shouldOverrideRawMethods: true, // console.error === logger.error, console.log === logger.log, so on so forth
    shouldPrefixPlainLoggingsIfNotOverrided: true,
    shouldNotShowTimeStamp: true
});

const chalk = logger.chalk;
const logLine = logger.logLines['='];
const colorfulLog = logger.log;
const colorfulInfo = logger.info;
const colorfulWarn = logger.warn;
const warnEMChalk = logger.warnEMChalk;
const cheersChalk = chalk.bgGreen.black;




shouldStripConsoleLoggingsFromJsFiles = shouldStripConsoleLoggingsFromJsFiles && shouldMinifyJsFiles;
shouldGenerateMapFilesForJs = shouldGenerateMapFilesForJs && shouldMinifyJsFiles;
shouldGenerateMapFilesForCss = shouldGenerateMapFilesForCss && shouldMinifyCssFiles;


// build up fullpaths and globs
const pathForCssSourceFiles = getJoinedPathFrom(pathForSourceFiles, folderOfCssFiles);
const pathForCssBuiltFiles = getJoinedPathFrom(pathForBuiltFiles, folderOfCssFiles);
const pathForJsSourceFiles = getJoinedPathFrom(pathForSourceFiles, folderOfJsFiles);
const pathForJsBuiltFiles = getJoinedPathFrom(pathForBuiltFiles, folderOfJsFiles);

const globsCssSourceFiles = [
    getJoinedPathFrom(pathForCssSourceFiles, '**/*.css')
];

const globsJsSourceFiles = [
    getJoinedPathFrom(pathForJsSourceFiles, '**/*.js')
];



const globsToWatch = []
    .concat(globsCssSourceFiles)
    .concat(globsJsSourceFiles)
    ;











if (isToDevelopWithWatching) {
    colorfulWarn(
        warnEMChalk('Running in DEVELOPMENT Mode! Have a Nice Day!')
    );
}

if (isToBuildForRelease) {
    colorfulLog(
        cheersChalk('Building app for releasing...! So exciting!')
    );
}



(function setupAllCSSTasks() {
    gulp.task('styles: remove old built files', () => {
        return del([
            getJoinedPathFrom(pathForCssBuiltFiles, '**/*')
        ]);
    });

    gulp.task('styles: build', (onThisTaskDone) => {
        let tasksToPump = [];

        tasksToPump.push(gulp.src(globsCssSourceFiles));

        if (shouldGenerateMapFilesForCss) {
            tasksToPump.push(sourcemaps.init());
        }

        if (shouldMinifyCssFiles) {
            tasksToPump.push(minifyCss());
        }

        tasksToPump.push(rename({ suffix: '.min' }));

        if (shouldGenerateMapFilesForCss) {
            tasksToPump.push(sourcemaps.write('.'));
        }

        tasksToPump.push(gulp.dest(pathForCssBuiltFiles));

        pump(tasksToPump, onThisTaskDone);
    });

    gulp.task('styles: all', (onThisTaskDone) => {
        runTasksInSequnce(
            'styles: remove old built files',
            [
                'styles: build'
            ]
        )(onThisTaskDone);
    });
})();


(function setupAllJSTasks() {
    gulp.task('javascript: remove old built files', () => {
        return del([
            getJoinedPathFrom(pathForJsBuiltFiles, '**/*')
        ]);
    });

    gulp.task('javascript: build', (onThisTaskDone) => {
        let tasksToPump = [];

        tasksToPump.push(gulp.src(globsJsSourceFiles));

        if (shouldGenerateMapFilesForJs) {
            tasksToPump.push(sourcemaps.init());
        }

        if (shouldStripConsoleLoggingsFromJsFiles) {
            tasksToPump.push(removeLogging(settingsForRemovingLoggingForJsFiles));
        }

        if (shouldMinifyJsFiles) {
            tasksToPump.push(uglifyJs());
        }
        tasksToPump.push(rename({ suffix: '.min' }));

        if (shouldGenerateMapFilesForJs) {
            tasksToPump.push(sourcemaps.write('.'));
        }

        tasksToPump.push(gulp.dest(pathForJsBuiltFiles));

        pump(tasksToPump, onThisTaskDone);
    });





    gulp.task('javascript: all', (onThisTaskDone) => {
        runTasksInSequnce(
            'javascript: remove old built files',
            [
                'javascript: build'
            ]
        )(onThisTaskDone);
    });
})();




gulp.task('app: build', [
    'styles: all',
    'javascript: all'
]);


(function setupWatching() {
    gulp.task('app: watch all source files', [], () => {
        return gulp.watch(globsToWatch, ['app: build'])
            .on('change', logWatchedChange);
    });

    function logWatchedChange(event) {
        let _path = event.path;
        let _posOfClientAppRoot = _path.indexOf(pathForSourceFiles);

        let subFolderOfChangedFile = _path;
        if (_posOfClientAppRoot > -1) {
            subFolderOfChangedFile = _path.slice(_posOfClientAppRoot + pathForSourceFiles.length);
        }

        let actionName = '';
        switch (event.type) {
        case 'added': actionName = 'added';
            break;
        case 'changed': actionName = 'changed';
            break;
        case 'renamed': actionName = 'renamed';
            break;
        case 'unlink':
        case 'deleted': actionName = 'deleted';
            break;
        default: actionName = event.type;
            break;
        }

        colorfulLog(chalk.cyan(
            logLine,

            '  '
            + 'File system changes happen under folder '
            + '[' + pathForSourceFiles + ']'
            + ':\n'
            + '  '
            + chalk.white.bgRed('<' + actionName + '>')
            + ' '
            + chalk.black.bgYellow('[' + subFolderOfChangedFile + ']'),

            logLine
        ));
    }
})();




(function setupTopLevelTasks() {
    const topLevelTasksToRun = [
        'app: build'
    ];

    if (isToDevelopWithWatching) {
        topLevelTasksToRun.push(
            'app: watch all source files'
        );
    }

    gulp.task('default', topLevelTasksToRun, (onThisTaskDone) => {
        if (isToBuildForRelease) {
            setTimeout(function () {
                colorfulLog(
                    cheersChalk('App is built sucessfully! Congradulations!')
                );
            }, 0);
        }

        onThisTaskDone();
    });
})();


// colorfulInfo(
//     logLine,
//     'Globs and tasks are prepared.',
//     logLine
// );
