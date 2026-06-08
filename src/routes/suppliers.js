const express = require('express');
const router = express.Router();
const pool = require('../db/index');

// GET todos los suppliers
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM suppliers ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST crear supplier
router.post('/', async (req, res) => {
  try {
    const { name, contact_email } = req.body;
    const result = await pool.query(
      `INSERT INTO suppliers (name, contact_email) VALUES ($1, $2) RETURNING *`,
      [name, contact_email]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;