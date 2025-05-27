import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Popconfirm,
  Typography,
  Card,
  Tag,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { employeeAPI } from '../services/api';
import type { Employee } from '../types';
import { EMPLOYEE_ROLE_OPTIONS, EMPLOYEE_STATUS_OPTIONS } from '../types';

const { Title } = Typography;

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeAPI.getAll();
      setEmployees(response.data);
    } catch (error) {
      message.error('加载员工列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingEmployee(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Employee) => {
    setEditingEmployee(record);
    const formData = {
      ...record,
      hire_date: record.hire_date ? dayjs(record.hire_date) : null,
    };
    form.setFieldsValue(formData);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await employeeAPI.delete(id);
      message.success('删除成功');
      loadEmployees();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const submitData = {
        ...values,
        hire_date: values.hire_date ? values.hire_date.format('YYYY-MM-DD') : null,
      };

      if (editingEmployee) {
        await employeeAPI.update(editingEmployee.id, submitData);
        message.success('更新成功');
      } else {
        await employeeAPI.create(submitData);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadEmployees();
    } catch (error) {
      message.error(editingEmployee ? '更新失败' : '创建失败');
    }
  };

  const columns = [
    {
      title: '员工姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '入职日期',
      dataIndex: 'hire_date',
      key: 'hire_date',
      render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD') : '-',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const roleOption = EMPLOYEE_ROLE_OPTIONS.find(option => option.value === role);
        return roleOption ? roleOption.label : role;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'active' ? 'green' : 'red';
        const statusOption = EMPLOYEE_STATUS_OPTIONS.find(option => option.value === status);
        return <Tag color={color}>{statusOption ? statusOption.label : status}</Tag>;
      },
    },
    {
      title: '订单数量',
      dataIndex: 'order_count',
      key: 'order_count',
    },
    {
      title: '总销售额',
      dataIndex: 'total_sales',
      key: 'total_sales',
      render: (value: number) => value ? `¥${value.toFixed(2)}` : '¥0.00',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Employee) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个员工吗？"
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
          <Title level={2}>员工管理</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加员工
          </Button>
        </div>

        <Card>
          <Table
            columns={columns}
            dataSource={employees}
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
        title={editingEmployee ? '编辑员工' : '添加员工'}
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
            label="员工姓名"
            rules={[{ required: true, message: '请输入员工姓名' }]}
          >
            <Input placeholder="请输入员工姓名" />
          </Form.Item>
          <Form.Item name="phone" label="联系电话">
            <Input placeholder="请输入联系电话" />
          </Form.Item>
          <Form.Item name="hire_date" label="入职日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择入职日期" />
          </Form.Item>
          <Form.Item name="role" label="角色">
            <Select placeholder="请选择角色" options={EMPLOYEE_ROLE_OPTIONS} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择状态" options={EMPLOYEE_STATUS_OPTIONS} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Employees;
