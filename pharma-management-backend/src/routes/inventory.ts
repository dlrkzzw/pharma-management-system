import express from 'express';
import db from '../database/init';

const router = express.Router();

// 获取库存变动记录
router.get('/movements', (req, res) => {
  const sql = `
    SELECT 
      im.*,
      m.name as medicine_name
    FROM inventory_movements im
    LEFT JOIN medicines m ON im.medicine_id = m.id
    ORDER BY im.created_at DESC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 获取进货记录
router.get('/purchases', (req, res) => {
  const sql = `
    SELECT 
      pr.*,
      m.name as medicine_name
    FROM purchase_records pr
    LEFT JOIN medicines m ON pr.medicine_id = m.id
    ORDER BY pr.created_at DESC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 添加进货记录
router.post('/purchase', (req, res) => {
  const {
    medicine_id,
    supplier_name,
    purchase_quantity,
    purchase_price,
    total_cost,
    purchase_date,
    batch_number,
    expiry_date,
    notes
  } = req.body;

  if (!medicine_id || !supplier_name || !purchase_quantity || !purchase_price || !purchase_date) {
    res.status(400).json({ error: '缺少必要字段' });
    return;
  }

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // 插入进货记录
    const purchaseSql = `
      INSERT INTO purchase_records (
        medicine_id, supplier_name, purchase_quantity, purchase_price,
        total_cost, purchase_date, batch_number, expiry_date, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(purchaseSql, [
      medicine_id, supplier_name, purchase_quantity, purchase_price,
      total_cost, purchase_date, batch_number, expiry_date, notes
    ], function(err) {
      if (err) {
        db.run('ROLLBACK');
        res.status(500).json({ error: err.message });
        return;
      }

      const purchaseId = this.lastID;

      // 更新库存
      db.run('UPDATE medicines SET stock_quantity = stock_quantity + ? WHERE id = ?',
        [purchase_quantity, medicine_id], (err) => {
        if (err) {
          db.run('ROLLBACK');
          res.status(500).json({ error: err.message });
          return;
        }

        // 记录库存变动
        db.run(`INSERT INTO inventory_movements
          (medicine_id, movement_type, quantity, reference_type, reference_id, notes)
          VALUES (?, 'in', ?, 'purchase', ?, ?)`,
          [medicine_id, purchase_quantity, purchaseId, `进货入库: ${supplier_name}`], (err) => {
          if (err) {
            db.run('ROLLBACK');
            res.status(500).json({ error: err.message });
            return;
          }

          db.run('COMMIT');
          res.status(201).json({
            message: '进货记录添加成功',
            id: purchaseId
          });
        });
      });
    });
  });
});

// 库存调整
router.post('/adjustment', (req, res) => {
  const { medicine_id, adjustment_type, quantity, notes } = req.body;

  if (!medicine_id || !adjustment_type || !quantity || !notes) {
    res.status(400).json({ error: '缺少必要字段' });
    return;
  }

  // 检查当前库存
  db.get('SELECT stock_quantity FROM medicines WHERE id = ?', [medicine_id], (err, row: any) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (!row) {
      res.status(404).json({ error: '药品不存在' });
      return;
    }

    const currentStock = row.stock_quantity;
    const adjustmentQuantity = adjustment_type === 'increase' ? quantity : -quantity;
    const newStock = currentStock + adjustmentQuantity;

    if (newStock < 0) {
      res.status(400).json({ error: '调整后库存不能为负数' });
      return;
    }

    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      // 更新库存
      db.run('UPDATE medicines SET stock_quantity = ? WHERE id = ?',
        [newStock, medicine_id], (err) => {
        if (err) {
          db.run('ROLLBACK');
          res.status(500).json({ error: err.message });
          return;
        }

        // 记录库存变动
        const movementType = adjustment_type === 'increase' ? 'in' : 'out';
        db.run(`INSERT INTO inventory_movements
          (medicine_id, movement_type, quantity, reference_type, reference_id, notes)
          VALUES (?, ?, ?, 'adjustment', NULL, ?)`,
          [medicine_id, movementType, quantity, notes], (err) => {
          if (err) {
            db.run('ROLLBACK');
            res.status(500).json({ error: err.message });
            return;
          }

          db.run('COMMIT');
          res.json({
            message: '库存调整成功',
            old_stock: currentStock,
            new_stock: newStock
          });
        });
      });
    });
  });
});

// 获取特定药品的库存变动记录
router.get('/movements/:medicine_id', (req, res) => {
  const { medicine_id } = req.params;

  const sql = `
    SELECT 
      im.*,
      m.name as medicine_name
    FROM inventory_movements im
    LEFT JOIN medicines m ON im.medicine_id = m.id
    WHERE im.medicine_id = ?
    ORDER BY im.created_at DESC
  `;

  db.all(sql, [medicine_id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

export default router;
