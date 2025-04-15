const express = require('express');
const router = express.Router();
const pool = require('../config/db'); 

// Get all schedules
router.get('/allschedules', async (req, res) => {
  try {
    const result = await pool.query(`
     SELECT 
        s.*, 
        CONCAT(b.first_name, ' ', b.last_name) AS babysitter_name
      FROM babysitter_schedules s
      JOIN babysitters b ON b.id = s.babysitter_id
      ORDER BY s.date DESC, s.start_time ASC;

    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});
// Get schedules for a specific babysitter
router.get('/babysitter/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT s.*, CONCAT(b.first_name, ' ', b.last_name) AS babysitter_name
       FROM babysitter_schedules s
       JOIN babysitters b ON b.id = s.babysitter_id
       WHERE s.babysitter_id = $1
       ORDER BY s.date DESC, s.start_time ASC`,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to fetch schedules');
  }
});

  

// Add new schedule
router.post('/addschedule', async (req, res) => {
  const { babysitter_id, date, start_time, end_time, session_type, status } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO babysitter_schedules (babysitter_id, date, start_time, end_time, session_type, status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [babysitter_id, date, start_time, end_time, session_type, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to add schedule');
  }
});

// Update schedule
router.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const { babysitter_id, date, start_time, end_time, session_type, status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE babysitter_schedules
       SET babysitter_id = $1, date = $2, start_time = $3, end_time = $4,
           session_type = $5, status = $6
       WHERE id = $7 RETURNING *`,
      [babysitter_id, date, start_time, end_time, session_type, status, id]
    );

    if (result.rowCount === 0) return res.status(404).send('Schedule not found');
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to update schedule');
  }
});

// Delete schedule
router.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`DELETE FROM babysitter_schedules WHERE id = $1`, [id]);

    if (result.rowCount === 0) return res.status(404).send('Schedule not found');
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to delete schedule');
  }
});

module.exports = router;
