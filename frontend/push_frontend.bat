@echo off
cd /d "%~dp0"
echo [1/4] Configuring Git Remote for Frontend...
git remote remove origin 2>nul
git remote add origin https://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@github.com/careercraftfyp/CCfrontend.git
git branch -M main

echo [2/4] Staging files...
git add .

echo [3/4] Creating commit...
git commit -m "Including Interview Archives"

echo [4/4] Pushing to GitHub...
git push -u origin main --force

echo.
echo ==========================================
echo Frontend successfully pushed to GitHub!
echo ==========================================
pause
