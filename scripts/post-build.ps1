#!/usr/bin/env pwsh

Push-Location "$PSScriptRoot/.."
try {
	'{ "type": "commonjs" }' | Out-File dist/cjs/package.json
	'{ "type": "module" }' | Out-File dist/mjs/package.json
} finally {
	Pop-Location
}
