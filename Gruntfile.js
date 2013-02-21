module.exports = function(grunt) {
    var coffeeGlob = {
        expand: true,
        cwd: '.',
        src: ['lib/**/*.coffee', 'test/**/*.coffee'],
        ext: '.js'
    }
    var csonGlob = {
        expand: true,
        cwd: '.',
        src: ['lib/**/*.cson', 'test/**/*.cson'],
        ext: '.json'
    }
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            coffee:{
                files: coffeeGlob.src,
                tasks: "coffee"
            },
            cson:{
                files: csonGlob.src,
                tasks: "cson"
            }
        },
        coffee: {
            files: coffeeGlob
        },
        cson: {
            files: csonGlob
        }

    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-coffee');

    grunt.registerMultiTask('cson', 'Compile CSON files into JSON', function() {
        var path = require('path');

        var options = this.options({
            bare: false,
            separator: grunt.util.linefeed
        });

        if (options.basePath || options.flatten) {
            grunt.fail.warn('Experimental destination wildcards are no longer supported. please refer to README.');
        }

        grunt.verbose.writeflags(options, 'Options');
        this.files.forEach(function(f) {
            var output = f.src.filter(function(filepath) {
                // Warn on and remove invalid source files (if nonull was set).
                if (!grunt.file.exists(filepath)) {
                    grunt.log.warn('Source file "' + filepath + '" not found.');
                    return false;
                } else {
                    return true;
                }
            }).map(function(filepath) {
                    return compileCson(filepath, options);
                }).join(grunt.util.normalizelf(options.separator));

            if (output.length < 1) {
                grunt.log.warn('Destination not written because compiled files were empty.');
            } else {
                grunt.file.write(f.dest, output);
                grunt.log.writeln('File ' + f.dest + ' created.');
            }
        });
    });

    var compileCson = function(srcFile, options) {
        options = grunt.util._.extend({filename: srcFile}, options);

        var srcCode = grunt.file.read(srcFile);

        try {
            var result = require('cson').parseSync(srcCode);
            return JSON.stringify(result, null, 2);
        } catch (e) {
            grunt.log.error(e);
            grunt.fail.warn('CSON failed to compile.');
        }
    };
};