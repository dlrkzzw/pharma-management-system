import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Space,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  message,
  Typography,
  Tabs,
  Tag,
  Divider,
} from 'antd';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { medicineAPI } from '../services/api';

const { Title } = Typography;

interface Medicine {
  id: number;
  name: string;
  specification: string;
  manufacturer: string;
  stock_quantity: number;
  unit_price: number;
  purchase_price: number;
}

interface InventoryMovement {
  id: number;
  medicine_id: number;
  medicine_name: string;
  movement_type: string;
  quantity: number;
  reference_type: string;
  reference_id: number;
  notes: string;
  created_at: string;
}

interface PurchaseRecord {
  id: number;
  medicine_id: number;
  medicine_name: string;
  supplier_name: string;
  purchase_quantity: number;
  purchase_price: number;
  total_cost: number;
  purchase_date: string;
  batch_number: string;
  expiry_date: string;
  notes: string;
  created_at: string;
}

const Inventory: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
  const [adjustmentModalVisible, setAdjustmentModalVisible] = useState(false);
  const [movementModalVisible, setMovementModalVisible] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);

  const [purchaseForm] = Form.useForm();
  const [adjustmentForm] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('开始加载库存数据...');

      const [medicinesRes, movementsRes, purchasesRes] = await Promise.all([
        medicineAPI.getAll(),
        fetch('http://localhost:3001/api/inventory/movements').then(res => res.json()),
        fetch('http://localhost:3001/api/inventory/purchases').then(res => res.json()),
      ]);

      console.log('药品数据:', medicinesRes.data);
      console.log('库存变动数据:', movementsRes);
      console.log('进货记录数据:', purchasesRes);

      setMedicines(medicinesRes.data);
      setMovements(movementsRes);
      setPurchases(purchasesRes);
    } catch (error: any) {
      console.error('加载数据失败:', error);
      message.error(`加载数据失败: ${error.message || '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (values: any) => {
    try {
      const submitData = {
        ...values,
        purchase_date: values.purchase_date.format('YYYY-MM-DD'),
        expiry_date: values.expiry_date ? values.expiry_date.format('YYYY-MM-DD') : null,
        total_cost: values.purchase_quantity * values.purchase_price,
      };

      await fetch('http://localhost:3001/api/inventory/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      message.success('进货记录添加成功');
      setPurchaseModalVisible(false);
      purchaseForm.resetFields();
      loadData();
    } catch (error) {
      message.error('进货记录添加失败');
    }
  };

  const handleAdjustment = async (values: any) => {
    try {
      await fetch('http://localhost:3001/api/inventory/adjustment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      message.success('库存调整成功');
      setAdjustmentModalVisible(false);
      adjustmentForm.resetFields();
      loadData();
    } catch (error) {
      message.error('库存调整失败');
    }
  };

  const showMovements = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setMovementModalVisible(true);
  };

  const medicineColumns = [
    { title: '药品名称', dataIndex: 'name', key: 'name' },
    { title: '规格', dataIndex: 'specification', key: 'specification' },
    { title: '生产厂家', dataIndex: 'manufacturer', key: 'manufacturer' },
    {
      title: '当前库存',
      dataIndex: 'stock_quantity',
      key: 'stock_quantity',
      render: (value: number) => (
        <Tag color={value <= 10 ? 'red' : value <= 50 ? 'orange' : 'green'}>
          {value}
        </Tag>
      ),
    },
    {
      title: '进货价',
      dataIndex: 'purchase_price',
      key: 'purchase_price',
      render: (value: number) => value ? `¥${value.toFixed(2)}` : '-',
    },
    {
      title: '销售价',
      dataIndex: 'unit_price',
      key: 'unit_price',
      render: (value: number) => value ? `¥${value.toFixed(2)}` : '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Medicine) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => showMovements(record)}
          >
            库存记录
          </Button>
        </Space>
      ),
    },
  ];

  const movementColumns = [
    {
      title: '药品名称',
      dataIndex: 'medicine_name',
      key: 'medicine_name'
    },
    {
      title: '变动类型',
      dataIndex: 'movement_type',
      key: 'movement_type',
      render: (type: string) => {
        const typeMap = { 'in': '入库', 'out': '出库', 'adjustment': '调整' };
        const color = type === 'in' ? 'green' : type === 'out' ? 'red' : 'blue';
        return <Tag color={color}>{typeMap[type as keyof typeof typeMap]}</Tag>;
      },
    },
    { title: '数量', dataIndex: 'quantity', key: 'quantity' },
    {
      title: '关联类型',
      dataIndex: 'reference_type',
      key: 'reference_type',
      render: (type: string) => {
        const typeMap = { 'purchase': '进货', 'order': '订单', 'adjustment': '调整' };
        return typeMap[type as keyof typeof typeMap] || type;
      },
    },
    { title: '备注', dataIndex: 'notes', key: 'notes' },
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
  ];

  const purchaseColumns = [
    { title: '药品名称', dataIndex: 'medicine_name', key: 'medicine_name' },
    { title: '供应商', dataIndex: 'supplier_name', key: 'supplier_name' },
    { title: '进货数量', dataIndex: 'purchase_quantity', key: 'purchase_quantity' },
    {
      title: '进货价格',
      dataIndex: 'purchase_price',
      key: 'purchase_price',
      render: (value: number) => value ? `¥${value.toFixed(2)}` : '-',
    },
    {
      title: '总成本',
      dataIndex: 'total_cost',
      key: 'total_cost',
      render: (value: number) => value ? `¥${value.toFixed(2)}` : '-',
    },
    {
      title: '进货日期',
      dataIndex: 'purchase_date',
      key: 'purchase_date',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    { title: '批次号', dataIndex: 'batch_number', key: 'batch_number' },
    {
      title: '有效期',
      dataIndex: 'expiry_date',
      key: 'expiry_date',
      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD') : '-',
    },
  ];

  const medicineOptions = medicines.map(medicine => ({
    label: `${medicine.name} ${medicine.specification || ''}`,
    value: medicine.id,
  }));

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2}>库存管理</Title>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setPurchaseModalVisible(true)}>
              添加进货
            </Button>
            <Button icon={<PlusOutlined />} onClick={() => setAdjustmentModalVisible(true)}>
              库存调整
            </Button>
          </Space>
        </div>

        <Card>
          <Tabs
            defaultActiveKey="1"
            items={[
              {
                key: '1',
                label: '库存概览',
                children: (
                  <Table
                    columns={medicineColumns}
                    dataSource={medicines}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total) => `共 ${total} 条记录`,
                    }}
                  />
                ),
              },
              {
                key: '2',
                label: '库存变动记录',
                children: (
                  <Table
                    columns={movementColumns}
                    dataSource={movements}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total) => `共 ${total} 条记录`,
                    }}
                  />
                ),
              },
              {
                key: '3',
                label: '进货记录',
                children: (
                  <Table
                    columns={purchaseColumns}
                    dataSource={purchases}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total) => `共 ${total} 条记录`,
                    }}
                  />
                ),
              },
            ]}
          />
        </Card>
      </Space>

      {/* 进货记录模态框 */}
      <Modal
        title="添加进货记录"
        open={purchaseModalVisible}
        onCancel={() => setPurchaseModalVisible(false)}
        onOk={() => purchaseForm.submit()}
        width={600}
      >
        <Form
          form={purchaseForm}
          layout="vertical"
          onFinish={handlePurchase}
        >
          <Form.Item
            name="medicine_id"
            label="药品"
            rules={[{ required: true, message: '请选择药品' }]}
          >
            <Select placeholder="请选择药品" options={medicineOptions} />
          </Form.Item>
          <Form.Item
            name="supplier_name"
            label="供应商"
            rules={[{ required: true, message: '请输入供应商名称' }]}
          >
            <Input placeholder="请输入供应商名称" />
          </Form.Item>
          <Form.Item
            name="purchase_quantity"
            label="进货数量"
            rules={[{ required: true, message: '请输入进货数量' }]}
          >
            <InputNumber placeholder="请输入进货数量" min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="purchase_price"
            label="进货价格"
            rules={[{ required: true, message: '请输入进货价格' }]}
          >
            <InputNumber placeholder="请输入进货价格" min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="purchase_date"
            label="进货日期"
            rules={[{ required: true, message: '请选择进货日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="batch_number"
            label="批次号"
          >
            <Input placeholder="请输入批次号" />
          </Form.Item>
          <Form.Item
            name="expiry_date"
            label="有效期"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="notes"
            label="备注"
          >
            <Input.TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 库存调整模态框 */}
      <Modal
        title="库存调整"
        open={adjustmentModalVisible}
        onCancel={() => setAdjustmentModalVisible(false)}
        onOk={() => adjustmentForm.submit()}
        width={500}
      >
        <Form
          form={adjustmentForm}
          layout="vertical"
          onFinish={handleAdjustment}
        >
          <Form.Item
            name="medicine_id"
            label="药品"
            rules={[{ required: true, message: '请选择药品' }]}
          >
            <Select placeholder="请选择药品" options={medicineOptions} />
          </Form.Item>
          <Form.Item
            name="adjustment_type"
            label="调整类型"
            rules={[{ required: true, message: '请选择调整类型' }]}
          >
            <Select placeholder="请选择调整类型">
              <Select.Option value="increase">增加库存</Select.Option>
              <Select.Option value="decrease">减少库存</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="quantity"
            label="调整数量"
            rules={[{ required: true, message: '请输入调整数量' }]}
          >
            <InputNumber placeholder="请输入调整数量" min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="notes"
            label="调整原因"
            rules={[{ required: true, message: '请输入调整原因' }]}
          >
            <Input.TextArea rows={3} placeholder="请输入调整原因" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 库存变动记录模态框 */}
      <Modal
        title={`${selectedMedicine?.name} 库存变动记录`}
        open={movementModalVisible}
        onCancel={() => setMovementModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedMedicine && (
          <div>
            <p><strong>当前库存：</strong>{selectedMedicine.stock_quantity}</p>
            <Divider />
            <Table
              columns={movementColumns.filter(col => col.key !== 'medicine_name')}
              dataSource={movements.filter(m => m.medicine_id === selectedMedicine.id)}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Inventory;
