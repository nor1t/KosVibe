@echo off
setlocal enabledelayedexpansion
for /f "usebackq tokens=1,* delims==" %%a in (".env") do (
  set "%%a=%%b"
)
node scripts/verify_sprint1.mjs
endlocal