# 医药代表业务管理系统

一个专为医药代表设计的全功能业务管理系统，帮助管理药品库存、医院客户、员工信息和销售订单。

## 🚀 功能特性

### 核心功能
- **药品管理** - 药品信息、库存管理、价格管理
- **医院管理** - 客户医院信息、联系方式、信用等级
- **医生管理** - 医生联系人信息、所属医院关联
- **员工管理** - 业务员信息、角色权限、入职管理
- **订单管理** - 销售订单创建、状态跟踪、付款管理
- **仪表盘** - 业务数据统计、图表展示

### 技术特性
- **响应式设计** - 支持桌面和移动设备
- **实时数据** - 数据实时更新和同步
- **用户友好** - 直观的操作界面和交互体验
- **数据安全** - 完整的数据验证和错误处理

## 🛠️ 技术栈

### 前端
- **React 18** - 现代化前端框架
- **TypeScript** - 类型安全的JavaScript
- **Ant Design** - 企业级UI组件库
- **React Router** - 单页应用路由
- **Axios** - HTTP客户端
- **Vite** - 快速构建工具

### 后端
- **Node.js** - JavaScript运行时
- **Express** - Web应用框架
- **TypeScript** - 类型安全开发
- **SQLite** - 轻量级数据库
- **CORS** - 跨域资源共享

## 📦 安装和运行

### 环境要求
- Node.js 16.0 或更高版本
- npm 或 yarn 包管理器

### 安装步骤

1. **克隆仓库**
```bash
git clone <repository-url>
cd pharma-management-system
```

2. **安装后端依赖**
```bash
cd pharma-management-backend
npm install
```

3. **安装前端依赖**
```bash
cd ../pharma-management-frontend
npm install
```

### 运行应用

1. **启动后端服务**
```bash
cd pharma-management-backend
npm run dev
```
后端服务将在 http://localhost:3001 启动

2. **启动前端应用**
```bash
cd pharma-management-frontend
npm run build
node serve-dist.js
```
前端应用将在 http://localhost:8080 启动

### 测试

运行自动化测试：
```bash
node test-automation.js
```

## 📁 项目结构

```
pharma-management-system/
├── pharma-management-backend/     # 后端API服务
│   ├── src/
│   │   ├── controllers/          # 控制器
│   │   ├── models/              # 数据模型
│   │   ├── routes/              # 路由定义
│   │   ├── middleware/          # 中间件
│   │   └── database/            # 数据库配置
│   └── package.json
├── pharma-management-frontend/    # 前端React应用
│   ├── src/
│   │   ├── components/          # 可复用组件
│   │   ├── pages/              # 页面组件
│   │   ├── services/           # API服务
│   │   └── types/              # TypeScript类型
│   └── package.json
├── test-automation.js            # 自动化测试脚本
└── README.md
```

## 🔄 版本历史

### v1.0.0 (当前版本)
- ✅ 完整的CRUD功能实现
- ✅ 响应式用户界面
- ✅ 数据验证和错误处理
- ✅ 自动化测试覆盖
- ✅ 生产环境构建优化

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 创建 Issue
- 发送邮件

---

**医药代表业务管理系统** - 让业务管理更简单高效！
