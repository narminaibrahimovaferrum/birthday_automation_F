@echo off
cd /d "C:\Users\narmina.ibrahimova\Desktop\birthday_automation"
set "PATH=C:\Program Files\nodejs;%LOCALAPPDATA%\Programs\nodejs;%PATH%"
call npm run run-now >> "logs\task_scheduler.log" 2>&1
