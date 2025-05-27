import express from 'express';
import { db } from '../database/init';

const router = express.Router();

// 获取所有员工
router.get('/', (req, res) => {
  const sql = `
    SELECT e.*,
           COUNT(so.id) as order_count,
           COALESCE(SUM(so.total_amount), 0) as total_sales
    FROM employees e
    LEFT JOIN sales_orders so ON e.id = so.employee_id
    GROUP BY e.id
    ORDER BY e.created_at DESC
  `;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

// 获取单个员工
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM employees WHERE id = ?';
  
  db.get(sql, [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: '员工不存在' });
      return;
    }
    res.json({ data: row });
  });
});

// 获取员工的订单列表
router.get('/:id/orders', (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT so.*, h.name as hospital_name, d.name as doctor_name
    FROM sales_orders so
    LEFT JOIN hospitals h ON so.hospital_id = h.id
    LEFT JOIN doctors d ON so.doctor_id = d.id
    WHERE so.employee_id = ?
    ORDER BY so.created_at DESC
  `;
  
  db.all(sql, [id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

// 创建员工
router.post('/', (req, res) => {
  const { name, phone, hire_date, role } = req.body;

  if (!name) {
    res.status(400).json({ error: '员工姓名不能为空' });
    return;
  }

  const sql = `
    INSERT INTO employees (name, phone, hire_date, role)
    VALUES (?, ?, ?, ?)
  `;

  db.run(sql, [name, phone, hire_date, role || 'salesperson'], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ 
      message: '员工创建成功', 
      id: this.lastID 
    });
  });
});

// 更新员工
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, phone, hire_date, role, status } = req.body;

  const sql = `
    UPDATE employees SET
      name = ?, phone = ?, hire_date = ?, role = ?, status = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(sql, [name, phone, hire_date, role, status, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: '员工不存在' });
      return;
    }
    res.json({ message: '员工更新成功' });
  });
});

// 删除员工
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  // 检查是否有关联的订单
  db.get('SELECT COUNT(*) as count FROM sales_orders WHERE employee_id = ?', [id], (err, row: any) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (row.count > 0) {
      res.status(400).json({ error: '该员工还有关联的订单，无法删除' });
      return;
    }
    
    const sql = 'DELETE FROM employees WHERE id = ?';
    db.run(sql, [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: '员工不存在' });
        return;
      }
      res.json({ message: '员工删除成功' });
    });
  });
});

export default router;
