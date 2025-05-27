import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Alert } from 'antd';
import {
  MedicineBoxOutlined,
  BankOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { medicineAPI, hospitalAPI, doctorAPI, orderAPI, healthCheck } from '../services/api';

const { Title } = Typography;

interface DashboardStats {
  medicineCount: number;
  hospitalCount: number;
  doctorCount: number;
  orderCount: number;
  totalSales: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    medicineCount: 0,
    hospitalCount: 0,
    doctorCount: 0,
    orderCount: 0,
    totalSales: 0,
  });
  const [loading, setLoading] = useState(true);
  const [serverStatus, setServerStatus] = useState<'online' | 'offline' | 'checking'>('checking');

  useEffect(() => {
    loadDashboardData();
    checkServerStatus();
  }, []);

  const checkServerStatus = async () => {
    try {
      await healthCheck();
      setServerStatus('online');
    } catch (error) {
      setServerStatus('offline');
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [medicinesRes, hospitalsRes, doctorsRes, ordersRes] = await Promise.all([
        medicineAPI.getAll(),
        hospitalAPI.getAll(),
        doctorAPI.getAll(),
        orderAPI.getAll(),
      ]);

      const totalSales = ordersRes.data.reduce((sum: number, order: any) => {
        return sum + (order.total_amount || 0);
      }, 0);

      setStats({
        medicineCount: medicinesRes.data.length,
        hospitalCount: hospitalsRes.data.length,
        doctorCount: doctorsRes.data.length,
        orderCount: ordersRes.data.length,
        totalSales: totalSales,
      });
    } catch (error) {
      console.error('加载仪表盘数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={2}>仪表盘</Title>
          {serverStatus === 'offline' && (
            <Alert
              message="服务器连接失败"
              description="无法连接到后端服务器，请检查服务器是否正常运行。"
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
          {serverStatus === 'online' && (
            <Alert
              message="系统运行正常"
              description="所有服务正常运行中。"
              type="success"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card>
              <Statistic
                title="药品总数"
                value={stats.medicineCount}
                prefix={<MedicineBoxOutlined />}
                loading={loading}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card>
              <Statistic
                title="合作医院"
                value={stats.hospitalCount}
                prefix={<BankOutlined />}
                loading={loading}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card>
              <Statistic
                title="医生联系人"
                value={stats.doctorCount}
                prefix={<UserOutlined />}
                loading={loading}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card>
              <Statistic
                title="订单总数"
                value={stats.orderCount}
                prefix={<ShoppingCartOutlined />}
                loading={loading}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card>
              <Statistic
                title="总销售额"
                value={stats.totalSales}
                prefix={<DollarOutlined />}
                precision={2}
                suffix="元"
                loading={loading}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title="快速操作" size="small">
              <Space wrap>
                <a href="/medicines">管理药品</a>
                <a href="/hospitals">管理医院</a>
                <a href="/doctors">管理医生</a>
                <a href="/orders">查看订单</a>
                <a href="/employees">管理员工</a>
              </Space>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card title="系统说明" size="small">
              <p>
                欢迎使用医药代表业务管理系统！这是第一期核心功能版本，包含以下模块：
              </p>
              <ul>
                <li><strong>药品管理：</strong>管理药品基础信息、库存和价格</li>
                <li><strong>客户管理：</strong>管理医院和医生联系人信息</li>
                <li><strong>订单管理：</strong>创建和跟踪销售订单</li>
                <li><strong>员工管理：</strong>管理业务员信息和业绩</li>
              </ul>
              <p>
                后续版本将增加财务管理、垫资跟踪、报表分析等高级功能。
              </p>
            </Card>
          </Col>
        </Row>
      </Space>
    </div>
  );
};

export default Dashboard;
