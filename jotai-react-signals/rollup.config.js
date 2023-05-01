const path = require('path');
const babelPlugin = require('@rollup/plugin-babel');
const resolve = require('@rollup/plugin-node-resolve');
const replace = require('@rollup/plugin-replace');
const terser = require('@rollup/plugin-terser');
const typescript = require('@rollup/plugin-typescript');
const { default: esbuild } = require('rollup-plugin-esbuild');
const createBabelConfig = require('./babel.config');

const extensions = ['.js', '.ts', '.tsx'];
const { root } = path.parse(process.cwd());

function external(id) {
	return !id.startsWith('.') && !id.startsWith(root);
}

function getBabelOptions(targets) {
	return {
		...createBabelConfig({ env: (env) => env === 'build' }, targets),
		extensions,
		comments: false,
		babelHelpers: 'bundled',
	};
}

function getEsbuild(target, env = 'development') {
	return esbuild({
		minify: env === 'production',
		target,
		tsconfig: path.resolve('./tsconfig.json'),
	});
}

function createDeclarationConfig(input, output) {
	return {
		input,
		output: {
			dir: output,
		},
		external,
		plugins: [
			typescript({
				declaration: true,
				emitDeclarationOnly: true,
				outDir: output,
			}),
		],
	};
}

function createESMConfig(input, output) {
	return {
		input,
		output: { file: output, format: 'esm' },
		external,
		plugins: [
			resolve({ extensions }),
			replace({
				...(output.endsWith('.js')
					? {
							'import.meta.env?.MODE': 'process.env.NODE_ENV',
					  }
					: {
							'import.meta.env?.MODE':
								'(import.meta.env && import.meta.env.MODE)',
					  }),
				delimiters: ['\\b', '\\b(?!(\\.|/))'],
				preventAssignment: true,
			}),
			getEsbuild('node12'),
		],
	};
}

function createCommonJSConfig(input, output) {
	return {
		input,
		output: { file: `${output}.js`, format: 'cjs' },
		external,
		plugins: [
			resolve({ extensions }),
			replace({
				'import.meta.env?.MODE': 'process.env.NODE_ENV',
				delimiters: ['\\b', '\\b(?!(\\.|/))'],
				preventAssignment: true,
			}),
			babelPlugin(getBabelOptions({ ie: 11 })),
		],
	};
}

function createSystemConfig(input, output, env) {
	return {
		input,
		output: {
			file: `${output}.${env}.js`,
			format: 'system',
		},
		external,
		plugins: [
			resolve({ extensions }),
			replace({
				'import.meta.env?.MODE': JSON.stringify(env),
				delimiters: ['\\b', '\\b(?!(\\.|/))'],
				preventAssignment: true,
			}),
			getEsbuild('node12', env),
		],
	};
}

module.exports = function (args) {
	return [
		createDeclarationConfig(`src/index.ts`, 'dist'),
		createCommonJSConfig(`src/index.ts`, `dist/index`),
		createESMConfig(`src/index.ts`, `dist/mjs/index.mjs`),
		createSystemConfig(`src/index.ts`, `dist/system/index`, 'development'),
		createSystemConfig(`src/index.ts`, `dist/system/index`, 'production'),
	];
};
