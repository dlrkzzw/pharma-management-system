import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证token等
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// 药品相关API
export const medicineAPI = {
  getAll: () => api.get('/medicines'),
  getById: (id: number) => api.get(`/medicines/${id}`),
  create: (data: any) => api.post('/medicines', data),
  update: (id: number, data: any) => api.put(`/medicines/${id}`, data),
  delete: (id: number) => api.delete(`/medicines/${id}`),
  getInventoryMovements: (id: number) => api.get(`/medicines/${id}/inventory-movements`),
  getPurchaseRecords: (id: number) => api.get(`/medicines/${id}/purchase-records`),
};

// 医院相关API
export const hospitalAPI = {
  getAll: () => api.get('/hospitals'),
  getById: (id: number) => api.get(`/hospitals/${id}`),
  getDoctors: (id: number) => api.get(`/hospitals/${id}/doctors`),
  create: (data: any) => api.post('/hospitals', data),
  update: (id: number, data: any) => api.put(`/hospitals/${id}`, data),
  delete: (id: number) => api.delete(`/hospitals/${id}`),
};

// 医生相关API
export const doctorAPI = {
  getAll: () => api.get('/doctors'),
  getById: (id: number) => api.get(`/doctors/${id}`),
  create: (data: any) => api.post('/doctors', data),
  update: (id: number, data: any) => api.put(`/doctors/${id}`, data),
  delete: (id: number) => api.delete(`/doctors/${id}`),
};

// 员工相关API
export const employeeAPI = {
  getAll: () => api.get('/employees'),
  getById: (id: number) => api.get(`/employees/${id}`),
  getOrders: (id: number) => api.get(`/employees/${id}/orders`),
  create: (data: any) => api.post('/employees', data),
  update: (id: number, data: any) => api.put(`/employees/${id}`, data),
  delete: (id: number) => api.delete(`/employees/${id}`),
};

// 订单相关API
export const orderAPI = {
  getAll: () => api.get('/orders'),
  getById: (id: number) => api.get(`/orders/${id}`),
  create: (data: any) => api.post('/orders', data),
  updateStatus: (id: number, data: any) => api.put(`/orders/${id}/status`, data),
  delete: (id: number) => api.delete(`/orders/${id}`),
};

// 健康检查
export const healthCheck = () => api.get('/health');

export default api;
