@echo off
set "PATH=%LOCALAPPDATA%\Programs\nodejs;$PATH%"
call npx ts-node scripts/checkTelegram.ts
pause
