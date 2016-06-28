module.exports = function (grunt) {

    var tasks   = grunt.file.readJSON('Grunttasks.json'),
        bwrFile = grunt.file.readJSON('bower.json');

    tasks["pkg"] = grunt.file.readJSON('package.json');

    //sets versioning regex pattern
    //we must do this here since a json file can't have regex
    tasks.replace["version"] = {
        "options": {
            "patterns": [
                {
                    "match": /_v(.*?)=*.(js|css)/g,
                    "replacement": "_v<%= pkg.version %>.$2"
                }
            ]
        },
        "files": [
            {
                "expand": true,
                "flatten": true,
                "src": ["index.html"],
                "dest": ""
            }
        ]
    };

    require('time-grunt')(grunt);

    grunt.initConfig(tasks);

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-rename');
    grunt.loadNpmTasks('grunt-bower-concat');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-compare-json');
    grunt.loadNpmTasks('grunt-nexus-artifact');
    grunt.loadNpmTasks('grunt-nexus-deployer');
    grunt.loadNpmTasks('grunt-maven-deploy');
    grunt.loadNpmTasks('grunt-maven-tasks');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-typescript');

    grunt.registerTask('default', []);


    /*
        Task:       grunt dev:(watch|null)
        Params:     watch [boolean] if set to true, watch will be fired (only accepts "watch")
        When:       Working on JS, CSS or HTML in the project
        Produces:   Non-minifed js & css files containing all libs and app files
        Sources:    index.html will refer to non-minified versions
    */
    grunt.registerTask('dev', function(watch){
        grunt.task.run([
            'clean:dist',               //remvoves files from dist folder
            'comparejson',              //compares keys in json lang files
            'replace:version',          //replaces the version value in index.html
            'typescript',               //generates js from ts wherever it's found in the client folder
            'bower_concat',             //concats all bower library js files (except excludes)
            'concat',                   //concats all js in app-angular folder to make app file
            'clean:typescript',         //deletes temp .ts folder
            'replace:dev',              //removes the "min" suffixes from the library script tags to point to dev version
            ((watch && watch == "watch") ? 'watch' : 'replace:dev')      //if watch is true starts watcher to update files on change
        ]);
    });


    /*
        Task:       grunt build:(debug|null)
        Params:     debug [boolean] if set to true, or provided, will set sources to non minified versions (only accepts "debug")
        When:       We want to test the minified version of the project
        Produces:   Concated & Minified js & css files containing all libs and app files
        Sources:    index.html will refer to minified versions
    */
    grunt.registerTask('build', function(debug){
        grunt.task.run([
            'clean:dist',           //remvoves files from dist folder
            'comparejson',          //compares keys in json lang files
            'replace:version',      //replaces the version value in index.html
            'typescript',               //generates js from ts wherever it's found in the client folder
            'bower_concat',          //concats all bower libraries except excludes
            'concat',               //concats all app files
            'clean:typescript',         //deletes temp .ts folder
            'copy:csslibs',         //css libs are already minified so this just copies another version and adds min
            'uglify',               //minifies all js libs and app files and creates .min versions
            'cssmin',               //minifies all css files into a single .min version
            'replace:' + ((debug && debug == "debug") ? "dev" : "dist")          //if debug set to false, replaces .js and .css to min.js and min.css
        ]);
    });


    /*
         Task:       grunt deploy-snapshot
         When:       We want to send the project to nexus for future deployment that sources debug version
         Produces:   Zips and deploys debug and prod versions of project to nexus
         Sources:    index.html will refer to debug versions
     */
    grunt.registerTask('deploy-snapshot', [
        'maven_deploy:snapshot'
    ]);


    /*
         Task:       grunt deploy-release
         When:       We want to send the project to nexus for future deployment that sources prod version
         Produces:   Zips and deploys debug and prod versions of project to nexus
         Sources:    index.html will refer to minified versions
     */
    grunt.registerTask('deploy-release', [
        'maven_deploy:release'
    ]);



    /*
         Task:       grunt build-deploy:(snapshot|release):(debug|null)
         Params:     debug [boolean] if set to debug, will build a debug version (only accepts "debug")
                     type (snapshot|release) selects the type of deployment (accepts "snapshot" or "release")
         When:       We want to build and send the project to nexus for future deployment into an evironment
         Produces:   Zips and deploys debug and prod versions of project to nexus
         Sources:    index.html will refer to min if debug is true
     */
    grunt.registerTask('build-deploy', function(type, debug){
        grunt.task.run([
            'build' + ((debug && debug == "debug") ? ':debug' : ''),
            'maven_deploy:' + type
        ]);
    });

};