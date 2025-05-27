// 药品类型
export interface Medicine {
  id: number;
  name: string;
  specification?: string;
  manufacturer?: string;
  approval_number?: string;
  current_cost_price?: number;
  suggested_price?: number;
  stock_quantity: number;
  safety_stock: number;
  created_at: string;
  updated_at: string;
}

// 医院类型
export interface Hospital {
  id: number;
  name: string;
  address?: string;
  level?: string;
  credit_level: string;
  doctor_count?: number;
  created_at: string;
  updated_at: string;
}

// 医生类型
export interface Doctor {
  id: number;
  name: string;
  hospital_id: number;
  hospital_name?: string;
  department?: string;
  position?: string;
  phone?: string;
  wechat?: string;
  email?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// 员工类型
export interface Employee {
  id: number;
  name: string;
  phone?: string;
  hire_date?: string;
  role: string;
  status: string;
  order_count?: number;
  total_sales?: number;
  created_at: string;
  updated_at: string;
}

// 订单类型
export interface Order {
  id: number;
  order_number: string;
  hospital_id: number;
  hospital_name?: string;
  doctor_id: number;
  doctor_name?: string;
  doctor_phone?: string;
  employee_id: number;
  employee_name?: string;
  order_date: string;
  status: string;
  total_amount: number;
  payment_status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  details?: OrderDetail[];
}

// 订单明细类型
export interface OrderDetail {
  id: number;
  order_id: number;
  medicine_id: number;
  medicine_name?: string;
  specification?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
}

// 库存变动记录类型
export interface InventoryMovement {
  id: number;
  medicine_id: number;
  movement_type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reference_type?: 'purchase' | 'order' | 'adjustment';
  reference_id?: number;
  reference_number?: string;
  notes?: string;
  created_at: string;
}

// 进货记录类型
export interface PurchaseRecord {
  id: number;
  medicine_id: number;
  supplier_name: string;
  purchase_quantity: number;
  purchase_price: number;
  total_cost: number;
  purchase_date: string;
  batch_number?: string;
  expiry_date?: string;
  notes?: string;
  created_at: string;
}

// API响应类型
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

// 表格分页类型
export interface TablePagination {
  current: number;
  pageSize: number;
  total: number;
}

// 订单状态选项
export const ORDER_STATUS_OPTIONS = [
  { label: '待确认', value: 'pending' },
  { label: '已确认', value: 'confirmed' },
  { label: '已发货', value: 'shipped' },
  { label: '已收货', value: 'received' },
  { label: '已完成', value: 'completed' },
];

// 付款状态选项
export const PAYMENT_STATUS_OPTIONS = [
  { label: '未付款', value: 'unpaid' },
  { label: '部分付款', value: 'partial' },
  { label: '已付款', value: 'paid' },
  { label: '垫资中', value: 'advance' },
];

// 员工角色选项
export const EMPLOYEE_ROLE_OPTIONS = [
  { label: '业务员', value: 'salesperson' },
  { label: '管理员', value: 'admin' },
];

// 员工状态选项
export const EMPLOYEE_STATUS_OPTIONS = [
  { label: '在职', value: 'active' },
  { label: '离职', value: 'inactive' },
];

// 医院等级选项
export const HOSPITAL_LEVEL_OPTIONS = [
  { label: '三甲', value: '三甲' },
  { label: '三乙', value: '三乙' },
  { label: '二甲', value: '二甲' },
  { label: '二乙', value: '二乙' },
  { label: '一甲', value: '一甲' },
  { label: '一乙', value: '一乙' },
];

// 信用等级选项
export const CREDIT_LEVEL_OPTIONS = [
  { label: 'A级', value: 'A' },
  { label: 'B级', value: 'B' },
  { label: 'C级', value: 'C' },
  { label: 'D级', value: 'D' },
];
