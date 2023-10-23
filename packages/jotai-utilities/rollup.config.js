const path = require('path');
const glob = require('glob-promise');
const {
	createDeclarationConfig,
	createCommonJSConfig,
	createESMConfig,
	createSystemConfig,
} = require('@principlestudios/shared/rollup.config');

module.exports = async function (args) {
	const files = await glob('src/*.ts', { ignore: '**/*.test.ts' });
	const fileNames = files.map((file) => path.basename(file, '.ts'));
	return fileNames.flatMap(fileName => [
		createDeclarationConfig(`src/${fileName}.ts`, 'dist'),
		createCommonJSConfig(`src/${fileName}.ts`, `dist/${fileName}`),
		createESMConfig(`src/${fileName}.ts`, `dist/mjs/${fileName}.mjs`),
		createSystemConfig(`src/${fileName}.ts`, `dist/system/${fileName}`, 'development'),
		createSystemConfig(`src/${fileName}.ts`, `dist/system/${fileName}`, 'production'),
	]);
};
