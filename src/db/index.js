const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = pool;

const createTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      contact_email VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS products (
      id SERIAL,
      sku VARCHAR(50) NOT NULL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      family VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS price_requests (
      id SERIAL PRIMARY KEY,
      supplier_id INT NOT NULL REFERENCES suppliers(id),
      sku VARCHAR(50) NOT NULL REFERENCES products(sku),
      previous_price DECIMAL(10,2) NOT NULL,
      new_price DECIMAL(10,2) NOT NULL,
      increment_percentage DECIMAL(5,2),
      status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('approved', 'pending', 'rejected', 'pending_review')),
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS price_history (
      id SERIAL PRIMARY KEY,
      sku VARCHAR(50) NOT NULL REFERENCES products(sku),
      supplier_id INT NOT NULL REFERENCES suppliers(id),
      price DECIMAL(10,2) NOT NULL,
      currency VARCHAR(3) NOT NULL DEFAULT 'MXN',
      recorded_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS landed_cost_snapshots (
      id SERIAL PRIMARY KEY,
      price_request_id INT NOT NULL REFERENCES price_requests(id),
      exchange_rate DECIMAL(10,4) NOT NULL,
      logistics_cost DECIMAL(10,2) NOT NULL,
      landed_cost DECIMAL(10,2) NOT NULL,
      currency VARCHAR(3) NOT NULL DEFAULT 'MXN',
      calculated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS evidences (
      id SERIAL PRIMARY KEY,
      price_request_id INT NOT NULL REFERENCES price_requests(id),
      file_type VARCHAR(20) CHECK (file_type IN ('pdf', 'email', 'documents')),
      file_url TEXT NOT NULL,
      uploaded_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL,
      entity VARCHAR(50) NOT NULL,
      entity_id INT NOT NULL,
      action VARCHAR(50) NOT NULL,
      before JSONB,
      after JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('Tables created successfully');
};

createTables().catch(console.error);