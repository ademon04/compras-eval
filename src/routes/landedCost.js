const express = require('express');
const router = express.Router();
const pool = require('../db/index');

// POST recalcular landed cost
router.post('/:requestId/recalculate', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { exchange_rate, logistics_cost, currency } = req.body;

    // Validar que el middleware mandó datos válidos
    if (!exchange_rate || !logistics_cost) {
      return res.status(400).json({ error: 'exchange_rate y logistics_cost son requeridos' });
    }

    if (exchange_rate <= 0 || logistics_cost < 0) {
      return res.status(400).json({ error: 'Valores inválidos recibidos del Middleware' });
    }

    // Obtener la solicitud
    const request = await pool.query(
      'SELECT * FROM price_requests WHERE id = $1',
      [requestId]
    );

    if (request.rows.length === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    const { new_price } = request.rows[0];

    // Calcular landed cost
    const landed_cost = (new_price * exchange_rate) + parseFloat(logistics_cost);

    // Guardar snapshot
    const snapshot = await pool.query(
      `INSERT INTO landed_cost_snapshots 
        (price_request_id, exchange_rate, logistics_cost, landed_cost, currency)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [requestId, exchange_rate, logistics_cost, landed_cost, currency || 'MXN']
    );

    res.status(201).json(snapshot.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET ver snapshots de una solicitud
router.get('/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const result = await pool.query(
      'SELECT * FROM landed_cost_snapshots WHERE price_request_id = $1 ORDER BY calculated_at DESC',
      [requestId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;