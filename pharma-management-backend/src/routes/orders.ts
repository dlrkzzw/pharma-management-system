import express from 'express';
import { db } from '../database/init';

const router = express.Router();

// 生成订单编号
function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const time = String(now.getTime()).slice(-6);
  return `ORD${year}${month}${day}${time}`;
}

// 获取所有订单
router.get('/', (req, res) => {
  const sql = `
    SELECT so.*,
           h.name as hospital_name,
           d.name as doctor_name,
           e.name as employee_name
    FROM sales_orders so
    LEFT JOIN hospitals h ON so.hospital_id = h.id
    LEFT JOIN doctors d ON so.doctor_id = d.id
    LEFT JOIN employees e ON so.employee_id = e.id
    ORDER BY so.created_at DESC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

// 获取单个订单详情
router.get('/:id', (req, res) => {
  const { id } = req.params;

  // 获取订单基本信息
  const orderSql = `
    SELECT so.*,
           h.name as hospital_name,
           d.name as doctor_name, d.phone as doctor_phone,
           e.name as employee_name
    FROM sales_orders so
    LEFT JOIN hospitals h ON so.hospital_id = h.id
    LEFT JOIN doctors d ON so.doctor_id = d.id
    LEFT JOIN employees e ON so.employee_id = e.id
    WHERE so.id = ?
  `;

  db.get(orderSql, [id], (err, order) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!order) {
      res.status(404).json({ error: '订单不存在' });
      return;
    }

    // 获取订单明细
    const detailsSql = `
      SELECT od.*, m.name as medicine_name, m.specification
      FROM order_details od
      LEFT JOIN medicines m ON od.medicine_id = m.id
      WHERE od.order_id = ?
    `;

    db.all(detailsSql, [id], (err, details) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      res.json({
        data: {
          ...order,
          details: details
        }
      });
    });
  });
});

// 创建订单
router.post('/', (req, res) => {
  const {
    hospital_id,
    doctor_id,
    employee_id,
    order_date,
    notes,
    details
  } = req.body;

  if (!hospital_id || !doctor_id || !employee_id || !details || details.length === 0) {
    res.status(400).json({ error: '订单信息不完整' });
    return;
  }

  const order_number = generateOrderNumber();

  // 计算总金额
  const total_amount = details.reduce((sum: number, item: any) => {
    return sum + (item.quantity * item.unit_price);
  }, 0);

  // 首先检查库存是否充足
  const checkStockPromises = details.map((detail: any) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT stock_quantity FROM medicines WHERE id = ?', [detail.medicine_id], (err, row: any) => {
        if (err) {
          reject(err);
        } else if (!row) {
          reject(new Error(`药品ID ${detail.medicine_id} 不存在`));
        } else if (row.stock_quantity < detail.quantity) {
          reject(new Error(`药品库存不足，当前库存：${row.stock_quantity}，需要：${detail.quantity}`));
        } else {
          resolve(true);
        }
      });
    });
  });

  Promise.all(checkStockPromises)
    .then(() => {
      // 库存检查通过，开始创建订单
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        // 插入订单
        const orderSql = `
          INSERT INTO sales_orders (
            order_number, hospital_id, doctor_id, employee_id,
            order_date, total_amount, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.run(orderSql, [
          order_number, hospital_id, doctor_id, employee_id,
          order_date, total_amount, notes
        ], function(err) {
      if (err) {
        db.run('ROLLBACK');
        res.status(500).json({ error: err.message });
        return;
      }

      const orderId = this.lastID;

      // 插入订单明细
      const detailSql = `
        INSERT INTO order_details (order_id, medicine_id, quantity, unit_price, subtotal)
        VALUES (?, ?, ?, ?, ?)
      `;

      let completed = 0;
      let hasError = false;

      details.forEach((detail: any) => {
        const subtotal = detail.quantity * detail.unit_price;

        db.run(detailSql, [
          orderId, detail.medicine_id, detail.quantity, detail.unit_price, subtotal
        ], (err) => {
          if (err && !hasError) {
            hasError = true;
            db.run('ROLLBACK');
            res.status(500).json({ error: err.message });
            return;
          }

          // 扣减库存
          db.run('UPDATE medicines SET stock_quantity = stock_quantity - ? WHERE id = ?',
            [detail.quantity, detail.medicine_id], (err) => {
            if (err && !hasError) {
              hasError = true;
              db.run('ROLLBACK');
              res.status(500).json({ error: err.message });
              return;
            }

            // 记录库存变动
            db.run(`INSERT INTO inventory_movements
              (medicine_id, movement_type, quantity, reference_type, reference_id, notes)
              VALUES (?, 'out', ?, 'order', ?, ?)`,
              [detail.medicine_id, detail.quantity, orderId, `订单出货: ${order_number}`], (err) => {
              if (err && !hasError) {
                hasError = true;
                db.run('ROLLBACK');
                res.status(500).json({ error: err.message });
                return;
              }

              completed++;
              if (completed === details.length && !hasError) {
                db.run('COMMIT');
                res.status(201).json({
                  message: '订单创建成功',
                  id: orderId,
                  order_number: order_number
                });
              }
            });
          });
        });
      });
        });
      });
    })
    .catch((error) => {
      res.status(400).json({ error: error.message });
    });
});

// 更新订单状态
router.put('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, payment_status } = req.body;

  const sql = `
    UPDATE sales_orders SET
      status = COALESCE(?, status),
      payment_status = COALESCE(?, payment_status),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(sql, [status, payment_status, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: '订单不存在' });
      return;
    }
    res.json({ message: '订单状态更新成功' });
  });
});

// 删除订单
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // 删除订单明细
    db.run('DELETE FROM order_details WHERE order_id = ?', [id], (err) => {
      if (err) {
        db.run('ROLLBACK');
        res.status(500).json({ error: err.message });
        return;
      }

      // 删除订单
      db.run('DELETE FROM sales_orders WHERE id = ?', [id], function(err) {
        if (err) {
          db.run('ROLLBACK');
          res.status(500).json({ error: err.message });
          return;
        }

        if (this.changes === 0) {
          db.run('ROLLBACK');
          res.status(404).json({ error: '订单不存在' });
          return;
        }

        db.run('COMMIT');
        res.json({ message: '订单删除成功' });
      });
    });
  });
});

export default router;
