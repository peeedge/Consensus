# Consensus — quick start for Windows / PowerShell.
#
#   .\bootstrap.ps1            install if needed, then start the dev server
#   .\bootstrap.ps1 --check    also typecheck and run the unit tests
#   .\bootstrap.ps1 --help     list every option

$ErrorActionPreference = 'Stop'

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node is not installed, or is not on your PATH." -ForegroundColor Red
  Write-Host "Install Node 22.12 or newer from https://nodejs.org and run this again."
  exit 1
}

node (Join-Path $PSScriptRoot 'scripts/bootstrap.mjs') @args
exit $LASTEXITCODE
