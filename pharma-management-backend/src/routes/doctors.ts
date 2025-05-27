import express from 'express';
import { db } from '../database/init';

const router = express.Router();

// 获取所有医生
router.get('/', (req, res) => {
  const sql = `
    SELECT d.*, h.name as hospital_name
    FROM doctors d
    LEFT JOIN hospitals h ON d.hospital_id = h.id
    ORDER BY d.created_at DESC
  `;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

// 获取单个医生
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT d.*, h.name as hospital_name
    FROM doctors d
    LEFT JOIN hospitals h ON d.hospital_id = h.id
    WHERE d.id = ?
  `;
  
  db.get(sql, [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: '医生不存在' });
      return;
    }
    res.json({ data: row });
  });
});

// 创建医生
router.post('/', (req, res) => {
  const {
    name,
    hospital_id,
    department,
    position,
    phone,
    wechat,
    email,
    notes
  } = req.body;

  if (!name) {
    res.status(400).json({ error: '医生姓名不能为空' });
    return;
  }

  if (!hospital_id) {
    res.status(400).json({ error: '所属医院不能为空' });
    return;
  }

  const sql = `
    INSERT INTO doctors (
      name, hospital_id, department, position, phone, wechat, email, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [
    name, hospital_id, department, position, phone, wechat, email, notes
  ], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ 
      message: '医生创建成功', 
      id: this.lastID 
    });
  });
});

// 更新医生
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const {
    name,
    hospital_id,
    department,
    position,
    phone,
    wechat,
    email,
    notes
  } = req.body;

  const sql = `
    UPDATE doctors SET
      name = ?, hospital_id = ?, department = ?, position = ?,
      phone = ?, wechat = ?, email = ?, notes = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(sql, [
    name, hospital_id, department, position, phone, wechat, email, notes, id
  ], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: '医生不存在' });
      return;
    }
    res.json({ message: '医生更新成功' });
  });
});

// 删除医生
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM doctors WHERE id = ?';
  
  db.run(sql, [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: '医生不存在' });
      return;
    }
    res.json({ message: '医生删除成功' });
  });
});

export default router;
