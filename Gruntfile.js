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
				src: ["**/*.ts", "!node_modules/**/*.ts"],
				reference: "typings/tsd.d.ts"
			}
		},

		tslint: {
            build: {
                files: {
                    src: ["**/*.ts", "!node_modules/**/*.ts", "!typings/**/*.ts"]
                },
                options: {
                    configuration: grunt.file.readJSON("./tslint.json")
                }
            }
        },

		clean: {
			src: ["**/*.js*", "!node_modules/**/*.js"]
		}
	});

	grunt.loadNpmTasks("grunt-ts");
	grunt.loadNpmTasks("grunt-tslint");

	grunt.registerTask("default", "ts:devall");
	grunt.registerTask("lint", ["tslint:build"]);
	grunt.registerTask("all", ["ts:devall", "lint"]);
}
