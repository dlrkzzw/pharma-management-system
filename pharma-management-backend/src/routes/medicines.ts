import express from 'express';
import { db } from '../database/init';

const router = express.Router();

// 获取所有药品
router.get('/', (req, res) => {
  const sql = `
    SELECT * FROM medicines
    ORDER BY created_at DESC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

// 获取单个药品
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM medicines WHERE id = ?';

  db.get(sql, [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: '药品不存在' });
      return;
    }
    res.json({ data: row });
  });
});

// 创建药品
router.post('/', (req, res) => {
  const {
    name,
    specification,
    manufacturer,
    approval_number,
    current_cost_price,
    suggested_price,
    stock_quantity,
    safety_stock
  } = req.body;

  if (!name) {
    res.status(400).json({ error: '药品名称不能为空' });
    return;
  }

  const sql = `
    INSERT INTO medicines (
      name, specification, manufacturer, approval_number,
      current_cost_price, suggested_price, stock_quantity, safety_stock
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [
    name, specification, manufacturer, approval_number,
    current_cost_price, suggested_price, stock_quantity || 0, safety_stock || 0
  ], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({
      message: '药品创建成功',
      id: this.lastID
    });
  });
});

// 更新药品
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const {
    name,
    specification,
    manufacturer,
    approval_number,
    current_cost_price,
    suggested_price,
    stock_quantity,
    safety_stock
  } = req.body;

  const sql = `
    UPDATE medicines SET
      name = ?, specification = ?, manufacturer = ?, approval_number = ?,
      current_cost_price = ?, suggested_price = ?, stock_quantity = ?,
      safety_stock = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(sql, [
    name, specification, manufacturer, approval_number,
    current_cost_price, suggested_price, stock_quantity, safety_stock, id
  ], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: '药品不存在' });
      return;
    }
    res.json({ message: '药品更新成功' });
  });
});

// 删除药品
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM medicines WHERE id = ?';

  db.run(sql, [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: '药品不存在' });
      return;
    }
    res.json({ message: '药品删除成功' });
  });
});

// 获取药品库存变动记录
router.get('/:id/inventory-movements', (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT im.*,
           CASE
             WHEN im.reference_type = 'order' THEN so.order_number
             WHEN im.reference_type = 'purchase' THEN pr.batch_number
             ELSE NULL
           END as reference_number
    FROM inventory_movements im
    LEFT JOIN sales_orders so ON im.reference_type = 'order' AND im.reference_id = so.id
    LEFT JOIN purchase_records pr ON im.reference_type = 'purchase' AND im.reference_id = pr.id
    WHERE im.medicine_id = ?
    ORDER BY im.created_at DESC
  `;

  db.all(sql, [id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

// 获取药品进货记录
router.get('/:id/purchase-records', (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT * FROM purchase_records
    WHERE medicine_id = ?
    ORDER BY purchase_date DESC
  `;

  db.all(sql, [id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

export default router;
