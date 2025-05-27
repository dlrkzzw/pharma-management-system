import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Typography,
  Card,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { hospitalAPI } from '../services/api';
import type { Hospital } from '../types';
import { HOSPITAL_LEVEL_OPTIONS, CREDIT_LEVEL_OPTIONS } from '../types';

const { Title } = Typography;

const Hospitals: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadHospitals();
  }, []);

  const loadHospitals = async () => {
    try {
      setLoading(true);
      const response = await hospitalAPI.getAll();
      setHospitals(response.data);
    } catch (error) {
      message.error('加载医院列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingHospital(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Hospital) => {
    setEditingHospital(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await hospitalAPI.delete(id);
      message.success('删除成功');
      loadHospitals();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingHospital) {
        await hospitalAPI.update(editingHospital.id, values);
        message.success('更新成功');
      } else {
        await hospitalAPI.create(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadHospitals();
    } catch (error) {
      message.error(editingHospital ? '更新失败' : '创建失败');
    }
  };

  const columns = [
    {
      title: '医院名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: '医院等级',
      dataIndex: 'level',
      key: 'level',
    },
    {
      title: '信用等级',
      dataIndex: 'credit_level',
      key: 'credit_level',
    },
    {
      title: '医生数量',
      dataIndex: 'doctor_count',
      key: 'doctor_count',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Hospital) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个医院吗？"
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
          <Title level={2}>医院管理</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加医院
          </Button>
        </div>

        <Card>
          <Table
            columns={columns}
            dataSource={hospitals}
            rowKey="id"
            loading={loading}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
            }}
          />
        </Card>
      </Space>

      <Modal
        title={editingHospital ? '编辑医院' : '添加医院'}
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
            label="医院名称"
            rules={[{ required: true, message: '请输入医院名称' }]}
          >
            <Input placeholder="请输入医院名称" />
          </Form.Item>
          <Form.Item name="address" label="地址">
            <Input placeholder="请输入医院地址" />
          </Form.Item>
          <Form.Item name="level" label="医院等级">
            <Select placeholder="请选择医院等级" options={HOSPITAL_LEVEL_OPTIONS} />
          </Form.Item>
          <Form.Item name="credit_level" label="信用等级">
            <Select placeholder="请选择信用等级" options={CREDIT_LEVEL_OPTIONS} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Hospitals;
