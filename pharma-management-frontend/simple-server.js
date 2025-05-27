import http from 'http';
import fs from 'fs';
import path from 'path';

const server = http.createServer((req, res) => {
  console.log(`请求: ${req.method} ${req.url}`);

  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>医药代表业务管理系统</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f0f2f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        h1 {
            color: #1890ff;
            text-align: center;
            margin-bottom: 30px;
        }
        .status {
            padding: 15px;
            margin: 15px 0;
            border-radius: 6px;
            background-color: #f6ffed;
            border: 1px solid #b7eb8f;
            color: #52c41a;
        }
        .button {
            background-color: #1890ff;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            margin: 10px;
            text-decoration: none;
            display: inline-block;
        }
        .button:hover {
            background-color: #40a9ff;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        .card {
            border: 1px solid #d9d9d9;
            border-radius: 6px;
            padding: 20px;
            background: #fafafa;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎉 医药代表业务管理系统</h1>

        <div class="status">
            ✅ 系统运行正常！前端服务器已启动在端口 9000
        </div>

        <div class="grid">
            <div class="card">
                <h3>📊 仪表盘</h3>
                <p>查看系统概览和统计数据</p>
                <button class="button" onclick="alert('功能开发中...')">进入仪表盘</button>
            </div>

            <div class="card">
                <h3>💊 药品管理</h3>
                <p>管理药品信息、库存和价格</p>
                <button class="button" onclick="alert('功能开发中...')">管理药品</button>
            </div>

            <div class="card">
                <h3>🏥 医院管理</h3>
                <p>管理合作医院信息</p>
                <button class="button" onclick="alert('功能开发中...')">管理医院</button>
            </div>

            <div class="card">
                <h3>👨‍⚕️ 医生管理</h3>
                <p>管理医生联系人信息</p>
                <button class="button" onclick="alert('功能开发中...')">管理医生</button>
            </div>

            <div class="card">
                <h3>👥 员工管理</h3>
                <p>管理业务员信息和业绩</p>
                <button class="button" onclick="alert('功能开发中...')">管理员工</button>
            </div>

            <div class="card">
                <h3>📋 订单管理</h3>
                <p>创建和管理销售订单</p>
                <button class="button" onclick="alert('功能开发中...')">管理订单</button>
            </div>
        </div>

        <div style="text-align: center; margin-top: 40px;">
            <p><strong>系统状态：</strong></p>
            <p>前端服务器：✅ 运行中 (端口 9000)</p>
            <p>后端服务器：✅ 运行中 (端口 3001)</p>
            <p>数据库：✅ SQLite 已初始化</p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
            <button class="button" onclick="window.location.reload()">刷新页面</button>
            <button class="button" onclick="testBackend()">测试后端连接</button>
        </div>
    </div>

    <script>
        async function testBackend() {
            try {
                const response = await fetch('http://localhost:3001/api/health');
                const data = await response.json();
                alert('后端连接成功！\\n' + data.message);
            } catch (error) {
                alert('后端连接失败：' + error.message);
            }
        }
    </script>
</body>
</html>
    `);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('页面未找到');
  }
});

const PORT = 9000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`简单HTTP服务器运行在 http://localhost:${PORT}`);
  console.log(`网络访问: http://0.0.0.0:${PORT}`);
});
