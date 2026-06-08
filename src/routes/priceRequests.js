const express = require('express');
const router = express.Router();
const pool = require('../db/index');

// GET todas las solicitudes
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM price_requests ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST crear solicitud
router.post('/', async (req, res) => {
  try {
    const { supplier_id, sku, previous_price, new_price } = req.body;
    const increment_percentage = ((new_price - previous_price) / previous_price) * 100;
    const status = increment_percentage > 8 ? 'pending_review' : 'pending';

    const result = await pool.query(
      `INSERT INTO price_requests (supplier_id, sku, previous_price, new_price, increment_percentage, status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [supplier_id, sku, previous_price, new_price, increment_percentage, status]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH aprobar solicitud
router.patch('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE price_requests SET status = 'approved' WHERE id = $1 RETURNING *`,
      [id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH rechazar solicitud
router.patch('/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE price_requests SET status = 'rejected' WHERE id = $1 RETURNING *`,
      [id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;