import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import './database/init';

// 导入路由
import medicineRoutes from './routes/medicines';
import hospitalRoutes from './routes/hospitals';
import doctorRoutes from './routes/doctors';
import employeeRoutes from './routes/employees';
import orderRoutes from './routes/orders';
import inventoryRoutes from './routes/inventory';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api/medicines', medicineRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: '医药代表业务管理系统后端运行正常' });
});

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
  console.log(`健康检查: http://localhost:${PORT}/api/health`);
});
