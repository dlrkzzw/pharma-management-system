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
  Input,

} from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined, EditOutlined, DownloadOutlined, SearchOutlined, ClearOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { orderAPI, hospitalAPI, doctorAPI, employeeAPI, medicineAPI } from '../services/api';
import type { Order, Hospital, Doctor, Employee, Medicine } from '../types';
import { ORDER_STATUS_OPTIONS, PAYMENT_STATUS_OPTIONS } from '../types';

const { Title } = Typography;

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);

  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [form] = Form.useForm();
  const [statusForm] = Form.useForm();
  const [filterForm] = Form.useForm();
  const [exportForm] = Form.useForm();

  // 筛选条件
  const [filters, setFilters] = useState<{
    employee_id?: number;
    hospital_id?: number;
    start_date?: string;
    end_date?: string;
    status?: string;
    payment_status?: string;
  }>({});

  useEffect(() => {
    loadOrders();
    loadBasicData();
  }, []);

  const loadOrders = async (filterParams?: any) => {
    try {
      setLoading(true);
      const params = filterParams || filters;
      const response = await orderAPI.getAll(params);
      setOrders(response.data);
    } catch (error) {
      message.error('加载订单列表失败');
    } finally {
      setLoading(false);
    }
  };

  const loadBasicData = async () => {
    try {
      setLoading(true);
      const [hospitalsRes, doctorsRes, employeesRes, medicinesRes] = await Promise.all([
        hospitalAPI.getAll(),
        doctorAPI.getAll(),
        employeeAPI.getAll(),
        medicineAPI.getAll(),
      ]);
      setHospitals(hospitalsRes.data);
      setDoctors(doctorsRes.data);
      setFilteredDoctors(doctorsRes.data);
      setEmployees(employeesRes.data);
      setMedicines(medicinesRes.data);
    } catch (error) {
      message.error('加载基础数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 筛选功能
  const handleFilter = (values: any) => {
    const filterParams: any = {};

    // 只添加有值的参数
    if (values.employee_id) filterParams.employee_id = values.employee_id;
    if (values.hospital_id) filterParams.hospital_id = values.hospital_id;
    if (values.status) filterParams.status = values.status;
    if (values.payment_status) filterParams.payment_status = values.payment_status;

    if (values.date_range && values.date_range.length === 2) {
      filterParams.start_date = values.date_range[0].format('YYYY-MM-DD');
      filterParams.end_date = values.date_range[1].format('YYYY-MM-DD');
    }

    setFilters(filterParams);
    loadOrders(filterParams);
  };

  const handleClearFilter = () => {
    filterForm.resetFields();
    setFilters({});
    loadOrders({});
  };

  // 医院选择变化时，过滤医生列表
  const handleHospitalChange = (hospitalId: number) => {
    if (hospitalId) {
      const filtered = doctors.filter(doctor => doctor.hospital_id === hospitalId);
      setFilteredDoctors(filtered);
    } else {
      setFilteredDoctors(doctors);
    }
    // 清空医生选择
    form.setFieldsValue({ doctor_id: undefined });
  };

  // 导出Excel功能
  const handleExport = async (values: any) => {
    try {
      setExportLoading(true);

      const exportParams: any = {};

      // 只添加有值的参数
      if (values.employee_id) exportParams.employee_id = values.employee_id;
      if (values.hospital_id) exportParams.hospital_id = values.hospital_id;
      if (values.status) exportParams.status = values.status;
      if (values.payment_status) exportParams.payment_status = values.payment_status;

      // 日期范围是必需的
      if (values.date_range && values.date_range.length === 2) {
        exportParams.start_date = values.date_range[0].format('YYYY-MM-DD');
        exportParams.end_date = values.date_range[1].format('YYYY-MM-DD');
      } else {
        message.error('请选择日期范围');
        setExportLoading(false);
        return;
      }

      // 调用导出API
      const response = await fetch(`http://localhost:3001/api/orders/export/data?${new URLSearchParams(exportParams)}`);
      const data = await response.json();

      if (data.data && data.data.length > 0) {
        // 处理导出数据
        const exportData = data.data.map((item: any) => ({
          '订单编号': item.order_number,
          '医院名称': item.hospital_name,
          '医院地址': item.hospital_address,
          '医生姓名': item.doctor_name,
          '医生电话': item.doctor_phone,
          '科室': item.department,
          '负责员工': item.employee_name,
          '订单日期': item.order_date,
          '药品名称': item.medicine_name,
          '规格': item.specification,
          '生产厂家': item.manufacturer,
          '数量': item.quantity,
          '单价': item.unit_price,
          '小计': item.subtotal,
          '订单总额': item.total_amount,
          '订单状态': item.status,
          '付款状态': item.payment_status,
          '备注': item.notes,
          '创建时间': item.created_at,
        }));

        // 创建工作簿
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '订单明细');

        // 生成文件名
        const fileName = `订单明细_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.xlsx`;

        // 导出文件
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        saveAs(blob, fileName);

        message.success(`导出成功！共导出 ${exportData.length} 条记录`);
        setExportModalVisible(false);
      } else {
        message.warning('没有符合条件的数据可导出');
      }
    } catch (error) {
      message.error('导出失败');
      console.error('Export error:', error);
    } finally {
      setExportLoading(false);
    }
  };

  const handleAdd = async () => {
    // 确保基础数据已加载
    if (hospitals.length === 0 || doctors.length === 0 || employees.length === 0 || medicines.length === 0) {
      message.loading('正在加载数据...', 1);
      await loadBasicData();
    }

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
      console.log('提交的表单数据:', values);

      const submitData = {
        ...values,
        order_date: values.order_date.format('YYYY-MM-DD'),
      };

      console.log('处理后的提交数据:', submitData);

      await orderAPI.create(submitData);
      message.success('创建成功');
      setModalVisible(false);
      loadOrders();
    } catch (error: any) {
      console.error('创建订单失败:', error);

      let errorMessage = '创建失败';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      console.log('错误信息:', errorMessage);
      message.error(errorMessage);
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

  const doctorOptions = filteredDoctors.map(doctor => ({
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
          <Space>
            <Button icon={<DownloadOutlined />} onClick={() => setExportModalVisible(true)}>
              导出Excel
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              创建订单
            </Button>
          </Space>
        </div>

        {/* 筛选条件 */}
        <Card title="筛选条件" size="small">
          <Form
            form={filterForm}
            onFinish={handleFilter}
            style={{ marginBottom: 16 }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'end' }}>
              <Form.Item name="employee_id" label="负责员工" style={{ marginBottom: 0 }}>
                <Select placeholder="选择员工" style={{ width: 150 }} allowClear>
                  {employeeOptions.map(option => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="hospital_id" label="医院" style={{ marginBottom: 0 }}>
                <Select placeholder="选择医院" style={{ width: 150 }} allowClear>
                  {hospitalOptions.map(option => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="date_range" label="订单日期" style={{ marginBottom: 0 }}>
                <DatePicker.RangePicker />
              </Form.Item>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'end', marginTop: 16 }}>
              <Form.Item name="status" label="订单状态" style={{ marginBottom: 0 }}>
                <Select placeholder="选择状态" style={{ width: 120 }} allowClear>
                  {ORDER_STATUS_OPTIONS.map(option => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="payment_status" label="付款状态" style={{ marginBottom: 0 }}>
                <Select placeholder="选择状态" style={{ width: 120 }} allowClear>
                  {PAYMENT_STATUS_OPTIONS.map(option => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Space>
                  <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                    筛选
                  </Button>
                  <Button onClick={handleClearFilter} icon={<ClearOutlined />}>
                    清空
                  </Button>
                </Space>
              </Form.Item>
            </div>
          </Form>
        </Card>

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
        confirmLoading={loading}
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
            <Select
              placeholder="请选择医院"
              options={hospitalOptions}
              onChange={handleHospitalChange}
            />
          </Form.Item>
          <Form.Item
            name="doctor_id"
            label="医生"
            rules={[{ required: true, message: '请选择医生' }]}
          >
            <Select
              placeholder="请先选择医院"
              options={doctorOptions}
              disabled={!form.getFieldValue('hospital_id')}
            />
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
          <Form.Item
            name="notes"
            label="备注"
          >
            <Input.TextArea rows={3} placeholder="请输入订单备注信息" />
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
                      label="药品"
                    >
                      <Select placeholder="选择药品" options={medicineOptions} style={{ width: 200 }} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'quantity']}
                      rules={[{ required: true, message: '请输入数量' }]}
                      label="数量"
                    >
                      <InputNumber placeholder="请输入数量" min={1} style={{ width: 120 }} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'unit_price']}
                      rules={[{ required: true, message: '请输入单价' }]}
                      label="单价(元)"
                    >
                      <InputNumber placeholder="请输入单价" min={0} precision={2} style={{ width: 120 }} />
                    </Form.Item>
                    <Button onClick={() => remove(name)} style={{ marginTop: 30 }}>删除</Button>
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
            {viewingOrder.notes && <p><strong>备注：</strong>{viewingOrder.notes}</p>}

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

      {/* 导出Excel模态框 */}
      <Modal
        title="导出订单Excel"
        open={exportModalVisible}
        onCancel={() => setExportModalVisible(false)}
        onOk={() => exportForm.submit()}
        width={600}
        confirmLoading={exportLoading}
      >
        <Form
          form={exportForm}
          layout="vertical"
          onFinish={handleExport}
          initialValues={{
            date_range: [dayjs().subtract(1, 'month'), dayjs()], // 默认最近一个月
          }}
        >
          <Form.Item name="employee_id" label="负责员工（可选）">
            <Select placeholder="选择员工" allowClear>
              {employeeOptions.map(option => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="hospital_id" label="医院（可选）">
            <Select placeholder="选择医院" allowClear>
              {hospitalOptions.map(option => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="date_range"
            label="订单日期范围"
            rules={[{ required: true, message: '请选择日期范围' }]}
          >
            <DatePicker.RangePicker
              style={{ width: '100%' }}
              placeholder={['开始日期', '结束日期']}
            />
          </Form.Item>
          <Form.Item name="status" label="订单状态（可选）">
            <Select placeholder="选择状态" allowClear>
              {ORDER_STATUS_OPTIONS.map(option => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="payment_status" label="付款状态（可选）">
            <Select placeholder="选择状态" allowClear>
              {PAYMENT_STATUS_OPTIONS.map(option => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Orders;
