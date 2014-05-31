module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-mocha-cli');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.initConfig({
        mochacli: {
            options: {
                reporter: 'spec',
                require: ['should']
            },
            all: ['test/']
        },
        jshint: {
            all: {
                src: ['src/**/*.js']
            }
        },
        uglify: {
            src: {
                files: {
                    'async-injector.min.js': ['src/async-injector.js']
                }
            }
        }
    });

    grunt.registerTask('build', ['uglify:src']);
    grunt.registerTask('lint', ['jshint:all']);
    grunt.registerTask('test', ['lint', 'mochacli:all']);
};
