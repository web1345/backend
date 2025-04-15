const { pool } = require('../model/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Register a new manager
const registerManager = async (req, res) => {
  const { email, password } = req.body;
  try {

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3)',
      [email, hashedPassword, 'manager']
    );
    res.status(201).json({ message: 'Manager registered' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid password' });

    let babysitterId = null;

    // If the user is a babysitter, get their babysitter record using user_id
    if (user.role === 'babysitter') {
      const babysitterResult = await pool.query(
        'SELECT id FROM babysitters WHERE user_id = $1',
        [user.id]
      );
      babysitterId = babysitterResult.rows[0]?.id || null;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ error: 'JWT secret is not configured' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      jwtSecret,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        user_id: babysitterId // Added field for babysitters
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Logout user
const logout = async (req, res) => {
  res.json({
    message: 'Logout successful. Please remove your token from client storage.'
  });
};

//getallusers
const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  registerManager,
  login,
  logout,
  getAllUsers,
};
