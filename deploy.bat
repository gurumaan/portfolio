@echo off
echo ==============================================
echo 🚀 DEPLOYING YOUR PORTFOLIO TO GITHUB PAGES
echo ==============================================
echo.
git branch -M main
git remote set-url origin https://github.com/gurumaan/portfolio.git 2>nul || git remote add origin https://github.com/gurumaan/portfolio.git
git push -u origin main
echo.
echo ✅ Done! After pushing, your portfolio will be live at:
echo 🌐 https://gurumaan.github.io/portfolio/
pause
