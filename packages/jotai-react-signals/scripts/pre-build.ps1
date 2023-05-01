#!/usr/bin/env pwsh

Push-Location "$PSScriptRoot/.."
try {
	# Remove old dist folder
	Remove-Item -r dist -ErrorAction SilentlyContinue
} finally {
	Pop-Location
}
