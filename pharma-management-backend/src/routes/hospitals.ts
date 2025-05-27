import express from 'express';
import { db } from '../database/init';

const router = express.Router();

// 获取所有医院
router.get('/', (req, res) => {
  const sql = `
    SELECT h.*, 
           COUNT(d.id) as doctor_count
    FROM hospitals h
    LEFT JOIN doctors d ON h.id = d.hospital_id
    GROUP BY h.id
    ORDER BY h.created_at DESC
  `;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

// 获取单个医院
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM hospitals WHERE id = ?';
  
  db.get(sql, [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: '医院不存在' });
      return;
    }
    res.json({ data: row });
  });
});

// 获取医院的医生列表
router.get('/:id/doctors', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM doctors WHERE hospital_id = ? ORDER BY created_at DESC';
  
  db.all(sql, [id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

// 创建医院
router.post('/', (req, res) => {
  const { name, address, level, credit_level } = req.body;

  if (!name) {
    res.status(400).json({ error: '医院名称不能为空' });
    return;
  }

  const sql = `
    INSERT INTO hospitals (name, address, level, credit_level)
    VALUES (?, ?, ?, ?)
  `;

  db.run(sql, [name, address, level, credit_level || 'A'], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ 
      message: '医院创建成功', 
      id: this.lastID 
    });
  });
});

// 更新医院
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, address, level, credit_level } = req.body;

  const sql = `
    UPDATE hospitals SET
      name = ?, address = ?, level = ?, credit_level = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(sql, [name, address, level, credit_level, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: '医院不存在' });
      return;
    }
    res.json({ message: '医院更新成功' });
  });
});

// 删除医院
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  // 检查是否有关联的医生
  db.get('SELECT COUNT(*) as count FROM doctors WHERE hospital_id = ?', [id], (err, row: any) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (row.count > 0) {
      res.status(400).json({ error: '该医院下还有医生，无法删除' });
      return;
    }
    
    const sql = 'DELETE FROM hospitals WHERE id = ?';
    db.run(sql, [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: '医院不存在' });
        return;
      }
      res.json({ message: '医院删除成功' });
    });
  });
});

export default router;
