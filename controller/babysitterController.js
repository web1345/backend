const { pool } = require('../model/User');
const bcrypt = require('bcrypt');
const { sendEmail } = require('../utils/mailer');
const addBabysitter = async (req, res) => {
    const {
      first_name,
      last_name,
      email,
      password,
      phone_number,
      nin,
      age,
      next_of_kin_name,
      next_of_kin_relationship,
      next_of_kin_phone,
    } = req.body;
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const userResult = await pool.query(
        'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id',
        [email, hashedPassword, 'babysitter']
      );
  
      const userId = userResult.rows[0].id;
  
      await pool.query(
        `INSERT INTO babysitters
          (user_id, first_name, last_name, phone_number, nin, age, next_of_kin_name, next_of_kin_relationship, next_of_kin_phone)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          userId,
          first_name,
          last_name,
          phone_number,
          nin,
          age,
          next_of_kin_name,
          next_of_kin_relationship,
          next_of_kin_phone,
        ]
      );
  
      // ✅ Send welcome email with password
      await sendEmail({
        to: email,
        subject: 'Welcome to Daycare – Your Babysitter Account',
        text: `Hi ${first_name}, your babysitter account has been created.
  
  Email: ${email}
  Password: ${password}
  
  Please log in and change your password as soon as possible.`,
        html: `
          <p>Hi <strong>${first_name}</strong>,</p>
          <p>Your babysitter account has been created successfully.</p>
          <p><strong>Login Details:</strong></p>
          <ul>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Password:</strong> ${password}</li>
          </ul>
          <p>Please log in and change your password immediately for security.</p>
          <p>Welcome aboard! 👶🍼</p>
        `
      });
  
      res.status(201).json({ message: 'Babysitter added and email sent.' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
// Get all babysitters with email and payments
const getAllBabysitters = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        b.*,
        u.email,
        COALESCE(json_agg(
          json_build_object(
            'id', p.id,
            'children_count', p.children_count,
            'amount', p.amount,
            'payment_date', p.date,
            'status', p.status,
            'session_type', p.session_type
          )
        ) FILTER (WHERE p.id IS NOT NULL), '[]') AS payments
      FROM babysitters b
      JOIN users u ON b.user_id = u.id
      LEFT JOIN babysitter_payments p ON p.babysitter_id = b.id
      GROUP BY b.id, u.email
    `);
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get one babysitter by ID
const getBabysitterById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        b.*,
        u.email,
        COALESCE(json_agg(
          json_build_object(
            'id', p.id,
            'children_count', p.children_count,
            'amount', p.amount,
            'payment_date', p.date,
            'status', p.status,
            'session_type', p.session_type
          )
        ) FILTER (WHERE p.id IS NOT NULL), '[]') AS payments
      FROM babysitters b
      JOIN users u ON b.user_id = u.id
      LEFT JOIN babysitter_payments p ON p.babysitter_id = b.id
      WHERE b.id = $1
      GROUP BY b.id, u.email
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Babysitter not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update babysitter info
const updateBabysitter = async (req, res) => {
  const { id } = req.params;
  const {
    first_name,
    last_name,
    phone_number,
    nin,
    age,
    next_of_kin_name,
    next_of_kin_relationship,
    next_of_kin_phone
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE babysitters
       SET first_name = $1,
           last_name = $2,
           phone_number = $3,
           nin = $4,
           age = $5,
           next_of_kin_name = $6,
           next_of_kin_relationship = $7,
           next_of_kin_phone = $8
       WHERE id = $9 RETURNING *`,
      [
        first_name,
        last_name,
        phone_number,
        nin,
        age,
        next_of_kin_name,
        next_of_kin_relationship,
        next_of_kin_phone,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Babysitter not found' });
    }

    res.status(200).json({ message: 'Babysitter updated successfully', babysitter: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete babysitter and user
const deleteBabysitter = async (req, res) => {
  const { id } = req.params;

  try {
    // Get user ID first
    const babysitter = await pool.query(`SELECT user_id FROM babysitters WHERE id = $1`, [id]);

    if (babysitter.rows.length === 0) {
      return res.status(404).json({ error: 'Babysitter not found' });
    }

    const userId = babysitter.rows[0].user_id;

    // Delete from babysitters
    await pool.query(`DELETE FROM babysitters WHERE id = $1`, [id]);

    // Optionally: delete related payments
    await pool.query(`DELETE FROM babysitter_payments WHERE babysitter_id = $1`, [id]);

    // Delete from users
    await pool.query(`DELETE FROM users WHERE id = $1`, [userId]);

    res.status(200).json({ message: 'Babysitter deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add child attendance for a babysitter
const addChildAttendance = async (req, res) => {
  const { babysitter_id, date, children } = req.body;

  try {
    for (const child of children) {
      await pool.query(
        `INSERT INTO child_attendance (babysitter_id, child_name, date)
         VALUES ($1, $2, $3)`,
        [babysitter_id, child.name, date]
      );
    }

    res.status(201).json({ message: 'Attendance initialized' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Check-in a child
const checkInChild = async (req, res) => {
  const { id } = req.params;
  const checkInTime = new Date().toTimeString().split(' ')[0]; // HH:MM:SS

  try {
    await pool.query(
      `UPDATE child_attendance
       SET check_in_time = $1, status = 'checked_in'
       WHERE id = $2`,
      [checkInTime, id]
    );
    res.status(200).json({ message: 'Child checked in' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Check-out a child
const checkOutChild = async (req, res) => {
  const { id } = req.params;
  const checkOutTime = new Date().toTimeString().split(' ')[0];

  try {
    await pool.query(
      `UPDATE child_attendance
       SET check_out_time = $1, status = 'checked_out'
       WHERE id = $2`,
      [checkOutTime, id]
    );
    res.status(200).json({ message: 'Child checked out' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get daily attendance report for a babysitter
const getDailyAttendance = async (req, res) => {
  const { babysitterId, date } = req.query;

  try {
    const attendanceRes = await pool.query(
      `SELECT * FROM child_attendance
       WHERE babysitter_id = $1 AND date = $2`,
      [babysitterId, date]
    );

    const summary = {
      total: attendanceRes.rowCount,
      checked_in: attendanceRes.rows.filter(c => c.status === 'checked_in').length,
      checked_out: attendanceRes.rows.filter(c => c.status === 'checked_out').length
    };

    res.status(200).json({ attendance: attendanceRes.rows, summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  addBabysitter,
  getAllBabysitters,
  getBabysitterById,
  updateBabysitter,
  deleteBabysitter,
  addChildAttendance,
  checkInChild,
  checkOutChild,
  getDailyAttendance
};
