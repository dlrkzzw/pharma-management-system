import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../database.sqlite');

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeTables();
  }
});

function initializeTables() {
  // 药品表
  db.run(`
    CREATE TABLE IF NOT EXISTS medicines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      specification TEXT,
      manufacturer TEXT,
      approval_number TEXT,
      current_cost_price DECIMAL(10,2),
      suggested_price DECIMAL(10,2),
      stock_quantity INTEGER DEFAULT 0,
      safety_stock INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 医院表
  db.run(`
    CREATE TABLE IF NOT EXISTS hospitals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT,
      level TEXT,
      credit_level TEXT DEFAULT 'A',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 医生表
  db.run(`
    CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      hospital_id INTEGER,
      department TEXT,
      position TEXT,
      phone TEXT,
      wechat TEXT,
      email TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (hospital_id) REFERENCES hospitals (id)
    )
  `);

  // 员工表
  db.run(`
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      hire_date DATE,
      role TEXT DEFAULT 'salesperson',
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 销售订单表
  db.run(`
    CREATE TABLE IF NOT EXISTS sales_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      hospital_id INTEGER,
      doctor_id INTEGER,
      employee_id INTEGER,
      order_date DATE,
      status TEXT DEFAULT 'pending',
      total_amount DECIMAL(10,2),
      payment_status TEXT DEFAULT 'unpaid',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (hospital_id) REFERENCES hospitals (id),
      FOREIGN KEY (doctor_id) REFERENCES doctors (id),
      FOREIGN KEY (employee_id) REFERENCES employees (id)
    )
  `);

  // 订单明细表
  db.run(`
    CREATE TABLE IF NOT EXISTS order_details (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      medicine_id INTEGER,
      quantity INTEGER,
      unit_price DECIMAL(10,2),
      subtotal DECIMAL(10,2),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES sales_orders (id),
      FOREIGN KEY (medicine_id) REFERENCES medicines (id)
    )
  `);

  // 价格历史表
  db.run(`
    CREATE TABLE IF NOT EXISTS price_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      medicine_id INTEGER,
      price_type TEXT,
      price DECIMAL(10,2),
      effective_date DATE,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (medicine_id) REFERENCES medicines (id)
    )
  `);

  console.log('Database tables initialized');
}

export default db;
