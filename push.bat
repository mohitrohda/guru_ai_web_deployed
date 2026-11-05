@echo off
cd /d "C:\Users\Admin\OneDrive\Desktop\guru-ai-website-final (3)\guru-ai"

git add .
set /p msg=Enter Commit Message: 
git commit -m "%msg%"
git push origin main

pause