/** @type {import('eslint').Linter.Config} */
module.exports = {
	root: true,
	settings: {
		react: {
			version: 'detect',
		},
	},
	plugins: ['@typescript-eslint', 'react', 'react-hooks'],
	extends: [
		// The order of these matter:
		// eslint baseline
		'eslint:recommended',
		// disables eslint rules in favor of using prettier separately
		'prettier',
		// React-recommended, followed by tuning off needing to `import React from "react"`
		'plugin:react/recommended',
		'plugin:react/jsx-runtime',
		// Recommended typescript changes, which removes some "no-undef" checks that TS handles
		'plugin:@typescript-eslint/recommended',
	],
	rules: {},
	ignorePatterns: ['/*.js*', '/*.cjs*'],
	overrides: [],
};
