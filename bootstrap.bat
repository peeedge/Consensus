@echo off
rem Consensus - quick start for Windows.
rem
rem   bootstrap.bat            install if needed, then start the dev server
rem   bootstrap.bat --check    also typecheck and run the unit tests
rem   bootstrap.bat --help     list every option
rem
rem Safe to double-click from Explorer, and safe to run from cmd or PowerShell.

setlocal
pushd "%~dp0"

rem Prefer PowerShell 7 when it is installed, otherwise use the one that ships
rem with Windows. -ExecutionPolicy Bypass keeps a restrictive machine policy
rem from blocking the wrapper.
set "PS=pwsh"
where pwsh >nul 2>&1 || set "PS=powershell"

"%PS%" -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0bootstrap.ps1" %*
set "EXITCODE=%ERRORLEVEL%"

popd

rem A double-click that fails would otherwise flash and vanish before the error
rem could be read, so hold the window open when something went wrong.
if not "%EXITCODE%"=="0" (
  echo.
  echo Exited with code %EXITCODE%.
  pause
)

exit /b %EXITCODE%
