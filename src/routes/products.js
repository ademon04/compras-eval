const express = require('express');
const router = express.Router();
const pool = require('../db/index');

// GET todos los products
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST crear product
router.post('/', async (req, res) => {
  try {
    const { sku, name, family } = req.body;
    const result = await pool.query(
      `INSERT INTO products (sku, name, family) VALUES ($1, $2, $3) RETURNING *`,
      [sku, name, family]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;