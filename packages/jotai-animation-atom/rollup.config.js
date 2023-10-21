const {
	createDeclarationConfig,
	createCommonJSConfig,
	createESMConfig,
	createSystemConfig,
} = require('@principlestudios/shared/rollup.config');

module.exports = function (args) {
	return [
		createDeclarationConfig(`src/index.ts`, 'dist'),
		createCommonJSConfig(`src/index.ts`, `dist/index`),
		createESMConfig(`src/index.ts`, `dist/mjs/index.mjs`),
		createSystemConfig(`src/index.ts`, `dist/system/index`, 'development'),
		createSystemConfig(`src/index.ts`, `dist/system/index`, 'production'),
	];
};
