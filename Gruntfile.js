module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-mocha-cli');
    grunt.loadNpmTasks('grunt-contrib-jshint');

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
                src: ['src/index.js'],
                directives: {
                    node: true,
                    nomen: true
                }
            }
        }
    });

    grunt.registerTask('lint', ['jshint:all']);
    grunt.registerTask('test', ['lint', 'mochacli:all']);
};
