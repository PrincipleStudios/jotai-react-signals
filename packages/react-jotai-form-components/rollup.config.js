const path = require('node:path');
const fs = require('node:fs/promises');
const {
	createCommonJSConfig,
	createESMConfig,
	createSystemConfig,
} = require('@principlestudios/shared/rollup.config');

module.exports = async function (args) {
	const possibleEntries = await fs.readdir('src');

	return possibleEntries
		.filter(
			(e) =>
				path.extname(e).startsWith('.ts') &&
				!e.endsWith('.test.ts') &&
				!e.endsWith('.test.tsx')
		)
		.map((e) => [e, e.substring(0, e.length - path.extname(e).length)])
		.flatMap(([entry, id]) => [
			createCommonJSConfig(`src/${entry}`, `dist/${id}`),
			createESMConfig(`src/${entry}`, `dist/mjs/${id}.mjs`),
			createSystemConfig(`src/${entry}`, `dist/system/${id}`, 'development'),
			createSystemConfig(`src/${entry}`, `dist/system/${id}`, 'production'),
		]);
};
