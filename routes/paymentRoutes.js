const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Create a new payment record
router.post('/generatepayment', async (req, res) => {
  const { babysitter_id, date, session_type, children_count, amount, status } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO babysitter_payments (babysitter_id, date, session_type, children_count, amount, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [babysitter_id, date, session_type, children_count, amount, status || 'pending']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating payment record:', err);
    res.status(500).send('Failed to create payment record');
  }
});

// Get all payment records
router.get('/allpayments', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.*, 
        CONCAT(b.first_name, ' ', b.last_name) AS babysitter_name
      FROM babysitter_payments p
      JOIN babysitters b ON b.id = p.babysitter_id
      ORDER BY p.date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching payments:', err);
    res.status(500).send('Failed to fetch payment records');
  }
});

// Update payment status
router.put('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE babysitter_payments SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rowCount === 0) return res.status(404).send('Payment record not found');
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).send('Failed to update payment status');
  }
});

// Delete payment record by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`DELETE FROM babysitter_payments WHERE id = $1 RETURNING *`, [id]);

    if (result.rowCount === 0) return res.status(404).send('Payment record not found');
    res.json({ message: 'Payment record deleted successfully', deleted: result.rows[0] });
  } catch (err) {
    console.error('Error deleting payment record:', err);
    res.status(500).send('Failed to delete payment record');
  }
});

module.exports = router;
