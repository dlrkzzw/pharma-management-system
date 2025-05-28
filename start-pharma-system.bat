@echo off
echo ========================================
echo 启动医药代表业务管理系统
echo ========================================

echo.
echo 正在启动后端服务器...
cd /d "C:\Users\zzw\auto\pharma-management-backend"
start "后端服务器" cmd /k "npm run dev"

echo.
echo 等待后端启动...
timeout /t 5 /nobreak > nul

echo.
echo 正在构建前端...
cd /d "C:\Users\zzw\auto\pharma-management-frontend"
call npm run build

echo.
echo 正在启动前端服务器...
start "前端服务器" cmd /k "node serve-dist.js"

echo.
echo 等待前端启动...
timeout /t 3 /nobreak > nul

echo.
echo 正在打开浏览器...
start http://localhost:8080

echo.
echo ========================================
echo 系统启动完成！
echo 前端地址: http://localhost:8080
echo 后端地址: http://localhost:3001
echo ========================================
echo.
echo 按任意键关闭此窗口...
pause > nul
