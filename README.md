# 医药代表业务管理系统 v1.2.0

一个专为医药代表设计的全功能业务管理系统，帮助管理药品库存、医院客户、员工信息和销售订单。

## 🚀 快速开始

### 方式1：一键启动脚本（推荐）
```bash
# 1. 克隆项目
git clone https://github.com/dlrkzzw/pharma-management-system.git
cd pharma-management-system

# 2. 安装依赖
cd pharma-management-backend && npm install
cd ../pharma-management-frontend && npm install

# 3. 一键启动（Windows）
双击运行 start-pharma-system.bat
```

### 方式2：手动启动
```bash
# 1. 克隆项目
git clone https://github.com/dlrkzzw/pharma-management-system.git
cd pharma-management-system

# 2. 安装依赖
cd pharma-management-backend && npm install
cd ../pharma-management-frontend && npm install

# 3. 启动后端 (终端1)
cd pharma-management-backend && npm run dev

# 4. 启动前端 (终端2)
cd pharma-management-frontend && npm run build && node serve-dist.js

# 5. 访问应用
# 前端: http://localhost:8080
# 后端API: http://localhost:3001
```

## 🚀 功能特性

### 核心功能
- **药品管理** - 药品信息、库存管理、价格管理
- **库存管理** - 📦 库存概览、变动记录、进货管理、自动库存调整
- **医院管理** - 客户医院信息、联系方式、信用等级
- **医生管理** - 医生联系人信息、所属医院关联
- **员工管理** - 业务员信息、角色权限、入职管理
- **订单管理** - 销售订单创建、状态跟踪、付款管理、自动库存扣减
- **仪表盘** - 业务数据统计、图表展示

### 🆕 v1.2.0 最新功能
- **🔍 订单筛选功能** - 支持按员工、医院、日期、状态等多维度筛选订单
- **📊 Excel导出功能** - 支持按条件导出订单详细数据到Excel文件
- **🔗 级联选择功能** - 医院-医生级联选择，提升用户体验
- **📱 响应式布局优化** - 改进筛选条件布局，支持多屏幕尺寸
- **⚡ API增强** - 订单API支持多参数筛选查询
- **🎨 UI/UX改进** - 优化表单布局和用户交互体验

### 🆕 v1.1.0 功能
- **智能库存管理** - 实时库存监控，颜色标识库存状态（红色=库存≤10，橙色=库存≤50，绿色=充足）
- **自动库存扣减** - 订单创建时自动扣减库存并记录变动历史
- **进货管理** - 支持添加进货记录，自动更新库存和成本计算
- **库存调整** - 支持手动增加/减少库存，并记录调整原因
- **库存变动追踪** - 完整的库存变动历史记录（进货、出货、调整）
- **库存不足保护** - 防止超出库存的订单创建，显示详细错误信息
- **改进的用户体验** - 更清晰的表单标签、更好的错误提示

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
- **XLSX** - Excel文件处理库 🆕
- **File-Saver** - 文件下载库 🆕

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
git clone https://github.com/dlrkzzw/pharma-management-system.git
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

## 📖 使用指南

### 🔍 订单筛选功能
1. 进入订单管理页面
2. 在"筛选条件"卡片中选择筛选条件：
   - **负责员工**：选择特定业务员
   - **医院**：选择特定医院
   - **订单日期**：选择日期范围
   - **订单状态**：pending、confirmed、shipped、delivered
   - **付款状态**：unpaid、paid、partial
3. 点击"筛选"按钮查看结果
4. 点击"清空"按钮重置所有筛选条件

### 📊 Excel导出功能
1. 在订单管理页面点击"导出Excel"按钮
2. 在弹出的对话框中设置导出条件：
   - **订单日期范围**：必填，默认最近一个月
   - **其他筛选条件**：可选，支持按员工、医院、状态筛选
3. 点击确定开始导出
4. 系统会自动下载Excel文件，包含完整的订单明细信息

### 🔗 级联选择功能
1. 点击"创建订单"按钮
2. **先选择医院**：从医院下拉列表中选择
3. **再选择医生**：医生列表会自动过滤为该医院的医生
4. 如果切换医院，医生选择会自动清空并重新过滤
5. 完成其他信息填写并提交订单

## 📸 功能展示

### 🏠 仪表盘
- 业务数据统计概览
- 图表展示关键指标

### 💊 药品管理
- 药品信息的增删改查
- 库存数量实时显示
- 价格管理

### 📦 库存管理 (v1.1.0 新增)
- **库存概览**：实时查看所有药品库存状态，颜色标识库存水平
- **库存变动记录**：完整的库存变动历史追踪
- **进货记录**：进货历史查询和管理
- **添加进货**：录入新的进货信息，自动更新库存
- **库存调整**：手动调整库存数量，记录调整原因

### 🏥 医院管理
- 客户医院信息管理
- 联系方式和信用等级

### 👨‍⚕️ 医生管理
- 医生联系人信息
- 医院关联管理

### 👥 员工管理
- 业务员信息管理
- 角色和权限设置

### 📋 订单管理
- 销售订单创建和编辑
- 订单状态和付款状态跟踪
- 自动库存扣减 (v1.1.0 新增)
- 库存不足保护 (v1.1.0 新增)
- **🔍 多维度筛选** - 按员工、医院、日期、状态筛选订单 (v1.2.0 新增)
- **📊 Excel导出** - 支持按条件导出订单详细数据 (v1.2.0 新增)
- **🔗 级联选择** - 医院-医生级联选择，智能过滤 (v1.2.0 新增)

## 📁 项目结构

```
pharma-management-system/
├── pharma-management-backend/     # 后端API服务
│   ├── src/
│   │   ├── routes/              # 路由定义
│   │   │   ├── medicines.ts     # 药品管理API
│   │   │   ├── hospitals.ts     # 医院管理API
│   │   │   ├── doctors.ts       # 医生管理API
│   │   │   ├── employees.ts     # 员工管理API
│   │   │   ├── orders.ts        # 订单管理API
│   │   │   └── inventory.ts     # 📦 库存管理API (新增)
│   │   ├── database/            # 数据库配置和迁移
│   │   └── index.ts             # 应用入口
│   └── package.json
├── pharma-management-frontend/    # 前端React应用
│   ├── src/
│   │   ├── components/          # 可复用组件
│   │   ├── pages/              # 页面组件
│   │   │   ├── Dashboard.tsx    # 仪表盘
│   │   │   ├── Medicines.tsx    # 药品管理
│   │   │   ├── Hospitals.tsx    # 医院管理
│   │   │   ├── Doctors.tsx      # 医生管理
│   │   │   ├── Employees.tsx    # 员工管理
│   │   │   ├── Orders.tsx       # 订单管理
│   │   │   └── Inventory.tsx    # 📦 库存管理 (新增)
│   │   ├── services/           # API服务
│   │   └── types/              # TypeScript类型
│   └── package.json
├── test-automation.js            # 自动化测试脚本
├── git-workflow.md              # Git工作流程文档
└── README.md
```

## 🔄 版本历史

### v1.2.0 (当前版本) - 2025-05-28
**🆕 新增订单筛选、Excel导出和级联选择功能**
- ✨ 订单筛选功能：支持按员工、医院、日期、状态等多维度筛选
- ✨ Excel导出功能：支持按条件导出订单详细数据到Excel文件
- ✨ 级联选择功能：医院-医生级联选择，提升用户体验
- ✨ 响应式布局优化：改进筛选条件布局，支持多屏幕尺寸
- 🔧 API增强：订单API支持多参数筛选查询
- 🔧 前端优化：集成xlsx库实现Excel导出功能
- 🔧 UI/UX改进：优化表单布局和用户交互体验
- 🔧 数据处理：改进参数过滤和验证逻辑

### v1.1.0 - 2025-05-27
**🆕 新增库存管理功能**
- ✨ 完整的库存管理系统（库存概览、变动记录、进货记录）
- ✨ 自动库存扣减和变动追踪
- ✨ 进货管理和库存调整功能
- ✨ 智能库存状态提示（颜色标识）
- ✨ 库存不足保护机制
- 🐛 修复数据库迁移问题
- 🐛 修复前端组件兼容性问题
- 🎨 改进用户界面和错误提示

### v1.0.0 - 2025-05-26
**🎉 初始版本发布**
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
