# 医药代表业务管理系统 - 技术设计文档 v1.2.0

## 📋 文档信息

| 项目信息 | 详情 |
|---------|------|
| **项目名称** | 医药代表业务管理系统 |
| **版本** | v1.2.0 |
| **文档类型** | 技术设计文档 |
| **创建日期** | 2025-05-27 |
| **更新日期** | 2025-05-28 |
| **技术栈** | React + TypeScript + Node.js + Express + SQLite + Excel导出 |

## 🆕 v1.2.0 版本更新

### 新增功能
- ✅ **订单筛选功能**：支持按员工、医院、日期、状态等多维度筛选
- ✅ **Excel导出功能**：支持按条件导出订单详细数据到Excel文件
- ✅ **级联选择功能**：医院-医生级联选择，提升用户体验
- ✅ **响应式布局优化**：改进筛选条件布局，支持多屏幕尺寸

### 技术改进
- 🔧 **API增强**：订单API支持多参数筛选查询
- 🔧 **前端优化**：使用xlsx库实现Excel导出功能
- 🔧 **UI/UX改进**：优化表单布局和用户交互体验
- 🔧 **数据处理**：改进参数过滤和验证逻辑

## 🏗️ 系统架构设计

### 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                    前端层 (Frontend)                         │
│  React 18 + TypeScript + Ant Design + Vite                │
├─────────────────────────────────────────────────────────────┤
│                    API层 (API Layer)                       │
│           RESTful API + Express + CORS                     │
├─────────────────────────────────────────────────────────────┤
│                   业务逻辑层 (Business)                      │
│        路由控制 + 数据验证 + 业务规则                        │
├─────────────────────────────────────────────────────────────┤
│                   数据访问层 (Data Access)                   │
│              SQLite + 事务管理 + 数据迁移                    │
└─────────────────────────────────────────────────────────────┘
```

### 技术选型理由

| 技术 | 选型理由 |
|------|----------|
| **React 18** | 现代化前端框架，组件化开发，生态完善 |
| **TypeScript** | 类型安全，减少运行时错误，提高代码质量 |
| **Ant Design** | 企业级UI组件库，开箱即用，设计规范 |
| **Express** | 轻量级Web框架，中间件丰富，易于扩展 |
| **SQLite** | 轻量级数据库，无需安装，适合中小型应用 |

## 🗄️ 数据库设计

### ER图关系

```
medicines (药品表)
    ├── 1:N → order_details (订单明细)
    ├── 1:N → inventory_movements (库存变动)
    └── 1:N → purchase_records (进货记录)

hospitals (医院表)
    ├── 1:N → doctors (医生表)
    └── 1:N → sales_orders (销售订单)

doctors (医生表)
    └── 1:N → sales_orders (销售订单)

employees (员工表)
    └── 1:N → sales_orders (销售订单)

sales_orders (销售订单表)
    ├── 1:N → order_details (订单明细)
    └── 1:N → inventory_movements (库存变动)
```

### 表结构设计

#### 1. medicines (药品表)
```sql
CREATE TABLE medicines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,                    -- 药品名称
  specification TEXT,                    -- 规格
  manufacturer TEXT,                     -- 生产厂家
  approval_number TEXT,                  -- 批准文号
  dosage_form TEXT,                      -- 剂型
  unit_price DECIMAL(10,2),             -- 销售单价
  purchase_price DECIMAL(10,2),         -- 进货价格
  stock_quantity INTEGER DEFAULT 0,      -- 库存数量
  min_stock_level INTEGER DEFAULT 10,    -- 最低库存预警
  storage_conditions TEXT,               -- 储存条件
  notes TEXT,                           -- 备注
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. hospitals (医院表)
```sql
CREATE TABLE hospitals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,                    -- 医院名称
  level TEXT,                           -- 医院等级
  address TEXT,                         -- 地址
  phone TEXT,                           -- 电话
  contact_person TEXT,                  -- 联系人
  credit_level TEXT DEFAULT 'good',     -- 信用等级
  notes TEXT,                           -- 备注
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. doctors (医生表)
```sql
CREATE TABLE doctors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,                    -- 医生姓名
  hospital_id INTEGER,                   -- 所属医院ID
  department TEXT,                       -- 科室
  position TEXT,                         -- 职位
  phone TEXT,                           -- 电话
  wechat TEXT,                          -- 微信
  email TEXT,                           -- 邮箱
  notes TEXT,                           -- 备注
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hospital_id) REFERENCES hospitals (id)
);
```

#### 4. employees (员工表)
```sql
CREATE TABLE employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,                    -- 员工姓名
  phone TEXT,                           -- 电话
  hire_date DATE,                       -- 入职日期
  role TEXT DEFAULT 'salesperson',      -- 角色
  status TEXT DEFAULT 'active',         -- 状态
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 5. sales_orders (销售订单表)
```sql
CREATE TABLE sales_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number TEXT UNIQUE NOT NULL,     -- 订单编号
  hospital_id INTEGER,                   -- 医院ID
  doctor_id INTEGER,                     -- 医生ID
  employee_id INTEGER,                   -- 负责员工ID
  order_date DATE,                       -- 订单日期
  status TEXT DEFAULT 'pending',         -- 订单状态
  total_amount DECIMAL(10,2),           -- 订单总金额
  payment_status TEXT DEFAULT 'unpaid', -- 付款状态
  notes TEXT,                           -- 备注
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hospital_id) REFERENCES hospitals (id),
  FOREIGN KEY (doctor_id) REFERENCES doctors (id),
  FOREIGN KEY (employee_id) REFERENCES employees (id)
);
```

#### 6. order_details (订单明细表)
```sql
CREATE TABLE order_details (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER,                      -- 订单ID
  medicine_id INTEGER,                   -- 药品ID
  quantity INTEGER,                      -- 数量
  unit_price DECIMAL(10,2),             -- 单价
  subtotal DECIMAL(10,2),               -- 小计
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES sales_orders (id),
  FOREIGN KEY (medicine_id) REFERENCES medicines (id)
);
```

#### 7. inventory_movements (库存变动记录表) 🆕
```sql
CREATE TABLE inventory_movements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  medicine_id INTEGER,                   -- 药品ID
  movement_type TEXT NOT NULL,           -- 变动类型: 'in'进货, 'out'出货, 'adjustment'调整
  quantity INTEGER NOT NULL,             -- 变动数量
  reference_type TEXT,                   -- 关联类型: 'purchase'进货, 'order'订单, 'adjustment'调整
  reference_id INTEGER,                  -- 关联记录ID
  notes TEXT,                           -- 备注
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (medicine_id) REFERENCES medicines (id)
);
```

#### 8. purchase_records (进货记录表) 🆕
```sql
CREATE TABLE purchase_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  medicine_id INTEGER,                   -- 药品ID
  supplier_name TEXT,                    -- 供应商名称
  purchase_quantity INTEGER,             -- 进货数量
  purchase_price DECIMAL(10,2),         -- 进货价格
  total_cost DECIMAL(10,2),             -- 总成本
  purchase_date DATE,                    -- 进货日期
  batch_number TEXT,                     -- 批次号
  expiry_date DATE,                      -- 有效期
  notes TEXT,                           -- 备注
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (medicine_id) REFERENCES medicines (id)
);
```

### 索引设计

```sql
-- 性能优化索引
CREATE INDEX idx_medicines_name ON medicines(name);
CREATE INDEX idx_orders_date ON sales_orders(order_date);
CREATE INDEX idx_orders_status ON sales_orders(status);
CREATE INDEX idx_inventory_medicine ON inventory_movements(medicine_id);
CREATE INDEX idx_inventory_type ON inventory_movements(movement_type);
CREATE INDEX idx_purchase_medicine ON purchase_records(medicine_id);
CREATE INDEX idx_purchase_date ON purchase_records(purchase_date);
```

## 🔧 后端API设计

### API架构

```
src/
├── index.ts                 # 应用入口
├── database/
│   └── init.ts             # 数据库初始化和迁移
└── routes/
    ├── medicines.ts        # 药品管理API
    ├── hospitals.ts        # 医院管理API
    ├── doctors.ts          # 医生管理API
    ├── employees.ts        # 员工管理API
    ├── orders.ts           # 订单管理API
    └── inventory.ts        # 库存管理API 🆕
```

### API接口设计

#### 1. 药品管理 (/api/medicines)

| 方法 | 路径 | 功能 | 参数 |
|------|------|------|------|
| GET | `/` | 获取药品列表 | - |
| GET | `/:id` | 获取药品详情 | id |
| POST | `/` | 创建药品 | name, specification, manufacturer, etc. |
| PUT | `/:id` | 更新药品 | id, 更新字段 |
| DELETE | `/:id` | 删除药品 | id |

#### 2. 库存管理 (/api/inventory) 🆕

| 方法 | 路径 | 功能 | 参数 |
|------|------|------|------|
| GET | `/movements` | 获取库存变动记录 | - |
| GET | `/movements/:medicine_id` | 获取特定药品变动记录 | medicine_id |
| GET | `/purchases` | 获取进货记录 | - |
| POST | `/purchase` | 添加进货记录 | medicine_id, supplier_name, quantity, etc. |
| POST | `/adjustment` | 库存调整 | medicine_id, adjustment_type, quantity, notes |

#### 3. 订单管理 (/api/orders) 🔄

| 方法 | 路径 | 功能 | 参数 |
|------|------|------|------|
| GET | `/` | 获取订单列表 | employee_id?, hospital_id?, start_date?, end_date?, status?, payment_status? |
| GET | `/:id` | 获取订单详情 | id |
| GET | `/export/data` | 获取导出数据 🆕 | employee_id?, hospital_id?, start_date?, end_date?, status?, payment_status? |
| POST | `/` | 创建订单 | hospital_id, doctor_id, employee_id, details |
| PUT | `/:id/status` | 更新订单状态 | id, status, payment_status |
| DELETE | `/:id` | 删除订单 | id |

#### 4. 医生管理 (/api/doctors) 🔄

| 方法 | 路径 | 功能 | 参数 |
|------|------|------|------|
| GET | `/` | 获取医生列表 | hospital_id? (支持按医院筛选) 🆕 |
| GET | `/:id` | 获取医生详情 | id |
| POST | `/` | 创建医生 | name, hospital_id, department, etc. |
| PUT | `/:id` | 更新医生 | id, 更新字段 |
| DELETE | `/:id` | 删除医生 | id |

### 核心业务逻辑

#### 1. 订单创建流程 🔄

```typescript
// 订单创建核心逻辑
async function createOrder(orderData) {
  // 1. 数据验证
  validateOrderData(orderData);

  // 2. 库存检查
  for (const detail of orderData.details) {
    const medicine = await getMedicine(detail.medicine_id);
    if (medicine.stock_quantity < detail.quantity) {
      throw new Error(`库存不足，当前库存：${medicine.stock_quantity}，需要：${detail.quantity}`);
    }
  }

  // 3. 开始事务
  db.run('BEGIN TRANSACTION');

  try {
    // 4. 创建订单
    const orderId = await insertOrder(orderData);

    // 5. 创建订单明细
    for (const detail of orderData.details) {
      await insertOrderDetail(orderId, detail);

      // 6. 扣减库存
      await updateMedicineStock(detail.medicine_id, -detail.quantity);

      // 7. 记录库存变动
      await insertInventoryMovement({
        medicine_id: detail.medicine_id,
        movement_type: 'out',
        quantity: detail.quantity,
        reference_type: 'order',
        reference_id: orderId
      });
    }

    // 8. 提交事务
    db.run('COMMIT');
    return { success: true, orderId };

  } catch (error) {
    // 9. 回滚事务
    db.run('ROLLBACK');
    throw error;
  }
}
```

#### 2. 进货管理流程 🔄

```typescript
// 进货记录创建逻辑
async function createPurchaseRecord(purchaseData) {
  db.run('BEGIN TRANSACTION');

  try {
    // 1. 创建进货记录
    const purchaseId = await insertPurchaseRecord(purchaseData);

    // 2. 更新库存
    await updateMedicineStock(purchaseData.medicine_id, purchaseData.purchase_quantity);

    // 3. 记录库存变动
    await insertInventoryMovement({
      medicine_id: purchaseData.medicine_id,
      movement_type: 'in',
      quantity: purchaseData.purchase_quantity,
      reference_type: 'purchase',
      reference_id: purchaseId
    });

    db.run('COMMIT');
    return { success: true, purchaseId };

  } catch (error) {
    db.run('ROLLBACK');
    throw error;
  }
}
```

#### 3. 库存调整流程 🔄

```typescript
// 库存调整逻辑
async function adjustInventory(adjustmentData) {
  const { medicine_id, adjustment_type, quantity, notes } = adjustmentData;

  // 1. 检查当前库存
  const currentStock = await getCurrentStock(medicine_id);
  const adjustmentQuantity = adjustment_type === 'increase' ? quantity : -quantity;
  const newStock = currentStock + adjustmentQuantity;

  if (newStock < 0) {
    throw new Error('调整后库存不能为负数');
  }

  db.run('BEGIN TRANSACTION');

  try {
    // 2. 更新库存
    await updateMedicineStock(medicine_id, adjustmentQuantity);

    // 3. 记录库存变动
    await insertInventoryMovement({
      medicine_id,
      movement_type: adjustment_type === 'increase' ? 'in' : 'out',
      quantity,
      reference_type: 'adjustment',
      reference_id: null,
      notes
    });

    db.run('COMMIT');
    return { success: true, oldStock: currentStock, newStock };

  } catch (error) {
    db.run('ROLLBACK');
    throw error;
  }
}
```

#### 4. 订单筛选查询逻辑 🆕

```typescript
// 订单筛选查询逻辑
async function getFilteredOrders(filters) {
  let sql = `
    SELECT so.*,
           h.name as hospital_name,
           d.name as doctor_name,
           e.name as employee_name
    FROM sales_orders so
    LEFT JOIN hospitals h ON so.hospital_id = h.id
    LEFT JOIN doctors d ON so.doctor_id = d.id
    LEFT JOIN employees e ON so.employee_id = e.id
    WHERE 1=1
  `;

  const params = [];

  // 动态添加筛选条件
  if (filters.employee_id) {
    sql += ' AND so.employee_id = ?';
    params.push(filters.employee_id);
  }

  if (filters.hospital_id) {
    sql += ' AND so.hospital_id = ?';
    params.push(filters.hospital_id);
  }

  if (filters.start_date) {
    sql += ' AND so.order_date >= ?';
    params.push(filters.start_date);
  }

  if (filters.end_date) {
    sql += ' AND so.order_date <= ?';
    params.push(filters.end_date);
  }

  if (filters.status) {
    sql += ' AND so.status = ?';
    params.push(filters.status);
  }

  if (filters.payment_status) {
    sql += ' AND so.payment_status = ?';
    params.push(filters.payment_status);
  }

  sql += ' ORDER BY so.created_at DESC';

  return await db.all(sql, params);
}
```

#### 5. Excel导出数据处理逻辑 🆕

```typescript
// Excel导出数据查询逻辑
async function getExportData(filters) {
  let sql = `
    SELECT so.*,
           h.name as hospital_name, h.address as hospital_address,
           d.name as doctor_name, d.phone as doctor_phone, d.department,
           e.name as employee_name,
           od.medicine_id, od.quantity, od.unit_price, od.subtotal,
           m.name as medicine_name, m.specification, m.manufacturer
    FROM sales_orders so
    LEFT JOIN hospitals h ON so.hospital_id = h.id
    LEFT JOIN doctors d ON so.doctor_id = d.id
    LEFT JOIN employees e ON so.employee_id = e.id
    LEFT JOIN order_details od ON so.id = od.order_id
    LEFT JOIN medicines m ON od.medicine_id = m.id
    WHERE 1=1
  `;

  // 应用相同的筛选逻辑
  const params = [];
  // ... 筛选条件处理逻辑 ...

  sql += ' ORDER BY so.created_at DESC, od.id ASC';

  return await db.all(sql, params);
}
```

## 🎨 前端架构设计

### 组件架构

```
src/
├── components/              # 公共组件
│   └── Layout.tsx          # 布局组件
├── pages/                  # 页面组件
│   ├── Dashboard.tsx       # 仪表盘
│   ├── Medicines.tsx       # 药品管理
│   ├── Hospitals.tsx       # 医院管理
│   ├── Doctors.tsx         # 医生管理
│   ├── Employees.tsx       # 员工管理
│   ├── Orders.tsx          # 订单管理
│   └── Inventory.tsx       # 库存管理 🆕
├── services/               # API服务
│   └── api.ts             # API封装
├── types/                  # TypeScript类型
│   └── index.ts           # 类型定义
└── App.tsx                # 应用入口
```

### 状态管理设计

#### 1. 组件状态管理

```typescript
// 典型页面组件状态结构
interface PageState {
  // 数据状态
  data: T[];
  loading: boolean;

  // UI状态
  modalVisible: boolean;
  selectedRecord: T | null;

  // 表单状态
  form: FormInstance;
}
```

#### 2. API调用封装

```typescript
// API服务封装
class APIService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: 'http://localhost:3001/api',
      timeout: 10000
    });

    // 响应拦截器
    this.api.interceptors.response.use(
      (response) => response.data,
      (error) => {
        // 统一错误处理
        if (error.response?.data?.error) {
          error.message = error.response.data.error;
        }
        return Promise.reject(error);
      }
    );
  }
}
```

### 关键组件设计

#### 1. 库存管理组件 🆕

```typescript
// Inventory.tsx 组件结构
const Inventory: React.FC = () => {
  // 状态管理
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);

  // 表单管理
  const [purchaseForm] = Form.useForm();
  const [adjustmentForm] = Form.useForm();

  // 业务逻辑
  const loadData = async () => { /* 数据加载逻辑 */ };
  const handlePurchase = async (values) => { /* 进货处理逻辑 */ };
  const handleAdjustment = async (values) => { /* 调整处理逻辑 */ };

  // 渲染逻辑
  return (
    <Tabs items={[
      { key: '1', label: '库存概览', children: <InventoryOverview /> },
      { key: '2', label: '库存变动记录', children: <MovementHistory /> },
      { key: '3', label: '进货记录', children: <PurchaseHistory /> }
    ]} />
  );
};
```

#### 2. 订单管理组件改进 🔄

```typescript
// Orders.tsx 关键改进
const Orders: React.FC = () => {
  // 新增状态管理
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [filters, setFilters] = useState<FilterParams>({});
  const [exportLoading, setExportLoading] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);

  // 筛选功能
  const handleFilter = (values: any) => {
    const filterParams: any = {};

    // 只添加有值的参数
    if (values.employee_id) filterParams.employee_id = values.employee_id;
    if (values.hospital_id) filterParams.hospital_id = values.hospital_id;
    if (values.status) filterParams.status = values.status;
    if (values.payment_status) filterParams.payment_status = values.payment_status;

    if (values.date_range && values.date_range.length === 2) {
      filterParams.start_date = values.date_range[0].format('YYYY-MM-DD');
      filterParams.end_date = values.date_range[1].format('YYYY-MM-DD');
    }

    setFilters(filterParams);
    loadOrders(filterParams);
  };

  // 医院-医生级联选择
  const handleHospitalChange = (hospitalId: number) => {
    if (hospitalId) {
      const filtered = doctors.filter(doctor => doctor.hospital_id === hospitalId);
      setFilteredDoctors(filtered);
    } else {
      setFilteredDoctors(doctors);
    }
    form.setFieldsValue({ doctor_id: undefined });
  };

  // Excel导出功能
  const handleExport = async (values: any) => {
    try {
      setExportLoading(true);

      const exportParams: any = {};

      // 只添加有值的参数
      if (values.employee_id) exportParams.employee_id = values.employee_id;
      if (values.hospital_id) exportParams.hospital_id = values.hospital_id;
      if (values.status) exportParams.status = values.status;
      if (values.payment_status) exportParams.payment_status = values.payment_status;

      // 日期范围是必需的
      if (values.date_range && values.date_range.length === 2) {
        exportParams.start_date = values.date_range[0].format('YYYY-MM-DD');
        exportParams.end_date = values.date_range[1].format('YYYY-MM-DD');
      } else {
        message.error('请选择日期范围');
        return;
      }

      // 调用导出API并处理Excel生成
      const response = await fetch(`http://localhost:3001/api/orders/export/data?${new URLSearchParams(exportParams)}`);
      const data = await response.json();

      if (data.data && data.data.length > 0) {
        // 使用xlsx库生成Excel文件
        const exportData = data.data.map((item: any) => ({
          '订单编号': item.order_number,
          '医院名称': item.hospital_name,
          '医院地址': item.hospital_address,
          '医生姓名': item.doctor_name,
          '医生电话': item.doctor_phone,
          '科室': item.department,
          '负责员工': item.employee_name,
          '订单日期': item.order_date,
          '药品名称': item.medicine_name,
          '规格': item.specification,
          '生产厂家': item.manufacturer,
          '数量': item.quantity,
          '单价': item.unit_price,
          '小计': item.subtotal,
          '订单总额': item.total_amount,
          '订单状态': item.status,
          '付款状态': item.payment_status,
          '备注': item.notes,
          '创建时间': item.created_at,
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '订单明细');

        const fileName = `订单明细_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.xlsx`;
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        saveAs(blob, fileName);

        message.success(`导出成功！共导出 ${exportData.length} 条记录`);
        setExportModalVisible(false);
      } else {
        message.warning('没有符合条件的数据可导出');
      }
    } catch (error) {
      message.error('导出失败');
    } finally {
      setExportLoading(false);
    }
  };
};
```

#### 3. 新增依赖库 🆕

```json
// package.json 新增依赖
{
  "dependencies": {
    "xlsx": "^0.18.5",
    "file-saver": "^2.0.5"
  },
  "devDependencies": {
    "@types/file-saver": "^2.0.5"
  }
}
```

## 🔄 数据流设计

### 1. 订单创建数据流

```
用户填写订单表单
    ↓
前端表单验证
    ↓
调用 orderAPI.create()
    ↓
后端接收请求
    ↓
库存检查
    ↓
开始数据库事务
    ↓
创建订单记录
    ↓
创建订单明细
    ↓
扣减库存
    ↓
记录库存变动
    ↓
提交事务
    ↓
返回成功响应
    ↓
前端更新UI
```

### 2. 库存管理数据流

```
用户操作 (进货/调整)
    ↓
前端表单验证
    ↓
调用库存API
    ↓
后端业务逻辑处理
    ↓
开始数据库事务
    ↓
更新库存数量
    ↓
记录变动历史
    ↓
提交事务
    ↓
返回响应
    ↓
前端刷新数据
```

## 🛡️ 错误处理设计

### 1. 前端错误处理

```typescript
// 统一错误处理策略
const handleError = (error: any, operation: string) => {
  console.error(`${operation}失败:`, error);

  let errorMessage = `${operation}失败`;
  if (error.response?.data?.error) {
    errorMessage = error.response.data.error;
  } else if (error.message) {
    errorMessage = error.message;
  }

  message.error(errorMessage);
};
```

### 2. 后端错误处理

```typescript
// API错误响应格式
interface ErrorResponse {
  error: string;
  code?: string;
  details?: any;
}

// 统一错误处理中间件
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('API Error:', err);

  const response: ErrorResponse = {
    error: err.message || '服务器内部错误'
  };

  res.status(500).json(response);
};
```

## 🔧 部署配置

### 1. 开发环境

```bash
# 后端启动
cd pharma-management-backend
npm run dev  # ts-node src/index.ts

# 前端启动
cd pharma-management-frontend
npm run build && node serve-dist.js
```

### 2. 生产环境配置

```typescript
// 环境变量配置
const config = {
  port: process.env.PORT || 3001,
  dbPath: process.env.DB_PATH || './database.sqlite',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:8080'
};
```

## 📊 性能优化

### 1. 数据库优化

- **索引策略**：为常用查询字段添加索引
- **事务管理**：使用事务保证数据一致性
- **连接池**：SQLite单连接，适合中小型应用

### 2. 前端优化

- **代码分割**：使用动态导入减少初始包大小
- **缓存策略**：API响应缓存，减少重复请求
- **组件优化**：使用React.memo避免不必要的重渲染

## 🧪 测试策略

### 1. 单元测试

```typescript
// API测试示例
describe('Inventory API', () => {
  test('should create purchase record', async () => {
    const purchaseData = {
      medicine_id: 1,
      supplier_name: '测试供应商',
      purchase_quantity: 100,
      purchase_price: 10.00
    };

    const response = await request(app)
      .post('/api/inventory/purchase')
      .send(purchaseData)
      .expect(201);

    expect(response.body.message).toBe('进货记录添加成功');
  });
});
```

### 2. 集成测试

```typescript
// 端到端测试
describe('Order Creation Flow', () => {
  test('should create order and update inventory', async () => {
    // 1. 检查初始库存
    const initialStock = await getMedicineStock(1);

    // 2. 创建订单
    await createOrder({
      medicine_id: 1,
      quantity: 5
    });

    // 3. 验证库存扣减
    const finalStock = await getMedicineStock(1);
    expect(finalStock).toBe(initialStock - 5);
  });
});
```

## 📈 扩展性设计

### 1. 模块化设计

- **路由模块化**：每个业务模块独立路由文件
- **组件复用**：公共组件抽取，提高复用性
- **API标准化**：统一的API设计规范

### 2. 未来扩展点

- **用户权限系统**：添加用户认证和权限控制
- **数据分析模块**：销售数据统计和分析
- **移动端适配**：响应式设计支持移动设备
- **微服务拆分**：业务模块独立部署

---

## 📝 更新日志

### v1.2.0 (2025-05-28)
- ✅ 新增订单筛选功能：支持按员工、医院、日期、状态等多维度筛选
- ✅ 新增Excel导出功能：支持按条件导出订单详细数据
- ✅ 新增级联选择功能：医院-医生级联选择，提升用户体验
- ✅ 优化前端布局：改进筛选条件布局，支持响应式设计
- 🔧 API增强：订单API支持多参数筛选查询
- 🔧 前端优化：集成xlsx库实现Excel导出功能
- 🔧 UI/UX改进：优化表单布局和用户交互体验

### v1.1.0 (2025-05-27)
- ✅ 完成基础功能开发：药品、医院、医生、员工、订单管理
- ✅ 实现库存管理：进货记录、库存变动追踪
- ✅ 订单-库存联动：订单创建自动扣减库存
- 🔧 建立完整的数据库设计和API架构
- 🔧 实现前后端分离架构

---

*文档版本：v1.2.0*
*最后更新：2025-05-28*
*项目仓库：https://github.com/dlrkzzw/pharma-management-system*