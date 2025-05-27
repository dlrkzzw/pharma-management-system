import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Popconfirm,
  Typography,
  Card,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { medicineAPI } from '../services/api';
import type { Medicine } from '../types';

const { Title } = Typography;

const Medicines: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    try {
      setLoading(true);
      const response = await medicineAPI.getAll();
      setMedicines(response.data);
    } catch (error) {
      message.error('加载药品列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingMedicine(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Medicine) => {
    setEditingMedicine(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await medicineAPI.delete(id);
      message.success('删除成功');
      loadMedicines();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingMedicine) {
        await medicineAPI.update(editingMedicine.id, values);
        message.success('更新成功');
      } else {
        await medicineAPI.create(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadMedicines();
    } catch (error) {
      message.error(editingMedicine ? '更新失败' : '创建失败');
    }
  };

  const columns = [
    {
      title: '药品名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      fixed: 'left' as const,
    },
    {
      title: '规格',
      dataIndex: 'specification',
      key: 'specification',
      width: 120,
    },
    {
      title: '生产厂家',
      dataIndex: 'manufacturer',
      key: 'manufacturer',
      width: 150,
    },
    {
      title: '成本价',
      dataIndex: 'current_cost_price',
      key: 'current_cost_price',
      width: 100,
      render: (value: number) => value ? `¥${value.toFixed(2)}` : '-',
    },
    {
      title: '建议售价',
      dataIndex: 'suggested_price',
      key: 'suggested_price',
      width: 100,
      render: (value: number) => value ? `¥${value.toFixed(2)}` : '-',
    },
    {
      title: '库存数量',
      dataIndex: 'stock_quantity',
      key: 'stock_quantity',
      width: 100,
    },
    {
      title: '安全库存',
      dataIndex: 'safety_stock',
      key: 'safety_stock',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: Medicine) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个药品吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2}>药品管理</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加药品
          </Button>
        </div>

        <Card>
          <Table
            columns={columns}
            dataSource={medicines}
            rowKey="id"
            loading={loading}
            scroll={{ x: 1000 }}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
            }}
          />
        </Card>
      </Space>

      <Modal
        title={editingMedicine ? '编辑药品' : '添加药品'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="药品名称"
            rules={[{ required: true, message: '请输入药品名称' }]}
          >
            <Input placeholder="请输入药品名称" />
          </Form.Item>
          <Form.Item name="specification" label="规格">
            <Input placeholder="请输入规格" />
          </Form.Item>
          <Form.Item name="manufacturer" label="生产厂家">
            <Input placeholder="请输入生产厂家" />
          </Form.Item>
          <Form.Item name="approval_number" label="批准文号">
            <Input placeholder="请输入批准文号" />
          </Form.Item>
          <Form.Item name="current_cost_price" label="成本价">
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入成本价"
              min={0}
              precision={2}
              addonAfter="元"
            />
          </Form.Item>
          <Form.Item name="suggested_price" label="建议售价">
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入建议售价"
              min={0}
              precision={2}
              addonAfter="元"
            />
          </Form.Item>
          <Form.Item name="stock_quantity" label="库存数量">
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入库存数量"
              min={0}
            />
          </Form.Item>
          <Form.Item name="safety_stock" label="安全库存">
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入安全库存"
              min={0}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Medicines;
