import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Select,
  DatePicker,
  message,
  Popconfirm,
  Typography,
  Card,
  Tag,
  InputNumber,
  Divider,
} from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { orderAPI, hospitalAPI, doctorAPI, employeeAPI, medicineAPI } from '../services/api';
import type { Order, Hospital, Doctor, Employee, Medicine } from '../types';
import { ORDER_STATUS_OPTIONS, PAYMENT_STATUS_OPTIONS } from '../types';

const { Title } = Typography;

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);

  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [form] = Form.useForm();
  const [statusForm] = Form.useForm();

  useEffect(() => {
    loadOrders();
    loadBasicData();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getAll();
      setOrders(response.data);
    } catch (error) {
      message.error('加载订单列表失败');
    } finally {
      setLoading(false);
    }
  };

  const loadBasicData = async () => {
    try {
      const [hospitalsRes, doctorsRes, employeesRes, medicinesRes] = await Promise.all([
        hospitalAPI.getAll(),
        doctorAPI.getAll(),
        employeeAPI.getAll(),
        medicineAPI.getAll(),
      ]);
      setHospitals(hospitalsRes.data);
      setDoctors(doctorsRes.data);
      setEmployees(employeesRes.data);
      setMedicines(medicinesRes.data);
    } catch (error) {
      message.error('加载基础数据失败');
    }
  };

  const handleAdd = () => {
    form.resetFields();
    form.setFieldsValue({
      order_date: dayjs(),
      details: [{ medicine_id: undefined, quantity: 1, unit_price: 0 }]
    });
    setModalVisible(true);
  };

  const handleView = async (record: Order) => {
    try {
      const response = await orderAPI.getById(record.id);
      setViewingOrder(response.data);
      setDetailModalVisible(true);
    } catch (error) {
      message.error('加载订单详情失败');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await orderAPI.delete(id);
      message.success('删除成功');
      loadOrders();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const submitData = {
        ...values,
        order_date: values.order_date.format('YYYY-MM-DD'),
      };

      await orderAPI.create(submitData);
      message.success('创建成功');
      setModalVisible(false);
      loadOrders();
    } catch (error) {
      message.error('创建失败');
    }
  };

  const handleEditStatus = (record: Order) => {
    setEditingOrder(record);
    statusForm.setFieldsValue({
      status: record.status,
      payment_status: record.payment_status,
    });
    setStatusModalVisible(true);
  };

  const handleStatusSubmit = async (values: any) => {
    if (!editingOrder) return;

    try {
      await orderAPI.updateStatus(editingOrder.id, values);
      message.success('状态更新成功');
      setStatusModalVisible(false);
      setEditingOrder(null);
      loadOrders();
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  const columns = [
    {
      title: '订单编号',
      dataIndex: 'order_number',
      key: 'order_number',
    },
    {
      title: '医院',
      dataIndex: 'hospital_name',
      key: 'hospital_name',
    },
    {
      title: '医生',
      dataIndex: 'doctor_name',
      key: 'doctor_name',
    },
    {
      title: '负责员工',
      dataIndex: 'employee_name',
      key: 'employee_name',
    },
    {
      title: '订单日期',
      dataIndex: 'order_date',
      key: 'order_date',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '订单金额',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (value: number) => `¥${value.toFixed(2)}`,
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusOption = ORDER_STATUS_OPTIONS.find(option => option.value === status);
        const color = status === 'completed' ? 'green' : status === 'pending' ? 'orange' : 'blue';
        return <Tag color={color}>{statusOption ? statusOption.label : status}</Tag>;
      },
    },
    {
      title: '付款状态',
      dataIndex: 'payment_status',
      key: 'payment_status',
      render: (status: string) => {
        const statusOption = PAYMENT_STATUS_OPTIONS.find(option => option.value === status);
        const color = status === 'paid' ? 'green' : status === 'unpaid' ? 'red' : 'orange';
        return <Tag color={color}>{statusOption ? statusOption.label : status}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Order) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditStatus(record)}
          >
            修改状态
          </Button>
          <Popconfirm
            title="确定要删除这个订单吗？"
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

  const doctorOptions = doctors.map(doctor => ({
    label: `${doctor.name} (${doctor.hospital_name})`,
    value: doctor.id,
  }));

  const employeeOptions = employees.map(employee => ({
    label: employee.name,
    value: employee.id,
  }));

  const medicineOptions = medicines.map(medicine => ({
    label: `${medicine.name} ${medicine.specification || ''}`,
    value: medicine.id,
  }));

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2}>订单管理</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            创建订单
          </Button>
        </div>

        <Card>
          <Table
            columns={columns}
            dataSource={orders}
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

      {/* 创建订单模态框 */}
      <Modal
        title="创建订单"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="hospital_id"
            label="医院"
            rules={[{ required: true, message: '请选择医院' }]}
          >
            <Select placeholder="请选择医院" options={hospitalOptions} />
          </Form.Item>
          <Form.Item
            name="doctor_id"
            label="医生"
            rules={[{ required: true, message: '请选择医生' }]}
          >
            <Select placeholder="请选择医生" options={doctorOptions} />
          </Form.Item>
          <Form.Item
            name="employee_id"
            label="负责员工"
            rules={[{ required: true, message: '请选择负责员工' }]}
          >
            <Select placeholder="请选择负责员工" options={employeeOptions} />
          </Form.Item>
          <Form.Item
            name="order_date"
            label="订单日期"
            rules={[{ required: true, message: '请选择订单日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Divider>订单明细</Divider>
          <Form.List name="details">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'medicine_id']}
                      rules={[{ required: true, message: '请选择药品' }]}
                    >
                      <Select placeholder="选择药品" options={medicineOptions} style={{ width: 200 }} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'quantity']}
                      rules={[{ required: true, message: '请输入数量' }]}
                    >
                      <InputNumber placeholder="数量" min={1} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'unit_price']}
                      rules={[{ required: true, message: '请输入单价' }]}
                    >
                      <InputNumber placeholder="单价" min={0} precision={2} />
                    </Form.Item>
                    <Button onClick={() => remove(name)}>删除</Button>
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    添加药品
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>

      {/* 订单详情模态框 */}
      <Modal
        title="订单详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {viewingOrder && (
          <div>
            <p><strong>订单编号：</strong>{viewingOrder.order_number}</p>
            <p><strong>医院：</strong>{viewingOrder.hospital_name}</p>
            <p><strong>医生：</strong>{viewingOrder.doctor_name}</p>
            <p><strong>负责员工：</strong>{viewingOrder.employee_name}</p>
            <p><strong>订单日期：</strong>{dayjs(viewingOrder.order_date).format('YYYY-MM-DD')}</p>
            <p><strong>订单金额：</strong>¥{viewingOrder.total_amount.toFixed(2)}</p>

            <Divider>订单明细</Divider>
            <Table
              dataSource={viewingOrder.details}
              rowKey="id"
              pagination={false}
              size="small"
              columns={[
                { title: '药品名称', dataIndex: 'medicine_name', key: 'medicine_name' },
                { title: '规格', dataIndex: 'specification', key: 'specification' },
                { title: '数量', dataIndex: 'quantity', key: 'quantity' },
                { title: '单价', dataIndex: 'unit_price', key: 'unit_price', render: (value: number) => `¥${value.toFixed(2)}` },
                { title: '小计', dataIndex: 'subtotal', key: 'subtotal', render: (value: number) => `¥${value.toFixed(2)}` },
              ]}
            />
          </div>
        )}
      </Modal>

      {/* 状态修改模态框 */}
      <Modal
        title="修改订单状态"
        open={statusModalVisible}
        onCancel={() => {
          setStatusModalVisible(false);
          setEditingOrder(null);
        }}
        onOk={() => statusForm.submit()}
        width={400}
      >
        <Form
          form={statusForm}
          layout="vertical"
          onFinish={handleStatusSubmit}
        >
          <Form.Item
            name="status"
            label="订单状态"
            rules={[{ required: true, message: '请选择订单状态' }]}
          >
            <Select placeholder="请选择订单状态" options={ORDER_STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item
            name="payment_status"
            label="付款状态"
            rules={[{ required: true, message: '请选择付款状态' }]}
          >
            <Select placeholder="请选择付款状态" options={PAYMENT_STATUS_OPTIONS} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Orders;
