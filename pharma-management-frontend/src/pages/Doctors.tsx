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
import { doctorAPI, hospitalAPI } from '../services/api';
import type { Doctor, Hospital } from '../types';

const { Title } = Typography;

const Doctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadDoctors();
    loadHospitals();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const response = await doctorAPI.getAll();
      setDoctors(response.data);
    } catch (error) {
      message.error('加载医生列表失败');
    } finally {
      setLoading(false);
    }
  };

  const loadHospitals = async () => {
    try {
      const response = await hospitalAPI.getAll();
      setHospitals(response.data);
    } catch (error) {
      message.error('加载医院列表失败');
    }
  };

  const handleAdd = () => {
    setEditingDoctor(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Doctor) => {
    setEditingDoctor(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await doctorAPI.delete(id);
      message.success('删除成功');
      loadDoctors();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingDoctor) {
        await doctorAPI.update(editingDoctor.id, values);
        message.success('更新成功');
      } else {
        await doctorAPI.create(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadDoctors();
    } catch (error) {
      message.error(editingDoctor ? '更新失败' : '创建失败');
    }
  };

  const columns = [
    {
      title: '医生姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '所属医院',
      dataIndex: 'hospital_name',
      key: 'hospital_name',
    },
    {
      title: '科室',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: '职务',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '微信号',
      dataIndex: 'wechat',
      key: 'wechat',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Doctor) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个医生吗？"
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

  const hospitalOptions = hospitals.map(hospital => ({
    label: hospital.name,
    value: hospital.id,
  }));

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2}>医生管理</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加医生
          </Button>
        </div>

        <Card>
          <Table
            columns={columns}
            dataSource={doctors}
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
        title={editingDoctor ? '编辑医生' : '添加医生'}
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
            label="医生姓名"
            rules={[{ required: true, message: '请输入医生姓名' }]}
          >
            <Input placeholder="请输入医生姓名" />
          </Form.Item>
          <Form.Item
            name="hospital_id"
            label="所属医院"
            rules={[{ required: true, message: '请选择所属医院' }]}
          >
            <Select placeholder="请选择所属医院" options={hospitalOptions} />
          </Form.Item>
          <Form.Item name="department" label="科室">
            <Input placeholder="请输入科室" />
          </Form.Item>
          <Form.Item name="position" label="职务">
            <Input placeholder="请输入职务" />
          </Form.Item>
          <Form.Item name="phone" label="联系电话">
            <Input placeholder="请输入联系电话" />
          </Form.Item>
          <Form.Item name="wechat" label="微信号">
            <Input placeholder="请输入微信号" />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item name="notes" label="备注">
            <Input.TextArea placeholder="请输入备注" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Doctors;
