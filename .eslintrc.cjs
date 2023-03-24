/** @type {import('eslint').Linter.Config} */
module.exports = {
	root: true,
	parserOptions: {
		project: './tsconfig.json',
		tsconfigRootDir: __dirname,
	},
	settings: {
		react: {
			version: 'detect',
		},
	},
	plugins: ['@typescript-eslint', 'react'],
	extends: [
		'next/core-web-vitals',
		// disables eslint rules in favor of using prettier separately
		'prettier',
	],
	rules: {},
	ignorePatterns: ['/*.js*', '/*.cjs*'],
	overrides: [],
};
