const { pool } = require('../model/User');
const bcrypt = require('bcrypt');

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
          first_name, // snake_case to match request
          last_name,
          phone_number,
          nin,
          age,
          next_of_kin_name,
          next_of_kin_relationship,
          next_of_kin_phone,
        ]
      );
  
      res.status(201).json({ message: 'Babysitter added successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  

module.exports = {
  addBabysitter,
};
