module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		ts: {
			options: {
				target: 'es5',
				module: 'commonjs',
				sourceMap: true,
				declaration: false,
				removeComments: false,
				noImplicitAny: true,
				experimentalDecorators: true
			},

			devall: {
				src: ["definitions.d.ts", "app.ts", "config/**/*.ts", "utilities/**/*.ts", "routes/**/*.ts", "data/**/*.ts"],
				reference: ".d.ts"
			}
		},

		tslint: {
            build: {
                files: {
                    src: ["app.ts", "config/**/*.ts", "utilities/**/*.ts", "routes/**/*.ts", "data/**/*.ts"]
                },
                options: {
                    configuration: grunt.file.readJSON("./tslint.json")
                }
            }
        },

		clean: {
            src: ["app.js", "config/**/*.js", "utilities/**/*.js", "routes/**/*.js", "data/**/*.js"]
		}
	});

	grunt.loadNpmTasks("grunt-ts");
	grunt.loadNpmTasks("grunt-tslint");
	grunt.loadNpmTasks("grunt-contrib-clean");

	grunt.registerTask("default", "ts:devall");
	grunt.registerTask("lint", ["tslint:build"]);
	grunt.registerTask("all", ["ts:devall", "lint"]);
}
