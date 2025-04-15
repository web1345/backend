const { pool } = require('../model/User');
const { sendEmail } = require('../utils/mailer');

// Add baby with parent email and send welcome email
exports.addBaby = async (req, res) => {
  const { name, age, parent_name, parent_phone, parent_email, special_needs, duration } = req.body;
  
  try {
    await pool.query(
      `INSERT INTO babies
       (name, age, parent_name, parent_phone, parent_email, special_needs, duration)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [name, age, parent_name, parent_phone, parent_email, special_needs, duration]
    );

    // Use the sendEmail helper function
    await sendEmail({
      to: parent_email,
      subject: 'Your child has been registered',
      text: `Hello ${parent_name},

Your child, ${name}, has been successfully registered into our babysitting system.

If you have any questions or updates, feel free to contact us!

Best regards,
Babysitting Service Team`
    });

    res.status(201).json({ message: 'Child added and email sent to parent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all babies
exports.getAllBabies = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM babies');
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }

};

// Get a single baby by ID
exports.getBabyById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM babies WHERE id = $1', [id]);
    const baby = result.rows[0];
    if (!baby) {
      return res.status(404).json({ error: 'Baby not found' });
    }
    res.status(200).json(baby);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a baby's details
exports.updateBaby = async (req, res) => {
  const { id } = req.params;
  const { name, age, parent_name, parent_phone, special_needs, duration } = req.body;
  try {
    const result = await pool.query(
      `UPDATE babies
       SET name = $1, age = $2, parent_name = $3, parent_phone = $4, special_needs = $5, duration = $6
       WHERE id = $7 RETURNING *`,
      [name, age, parent_name, parent_phone, special_needs, duration, id]
    );
    const baby = result.rows[0];
    if (!baby) {
      return res.status(404).json({ error: 'Baby not found' });
    }
    res.status(200).json({ message: 'Baby updated', baby });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a baby
exports.deleteBaby = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM babies WHERE id = $1 RETURNING *', [id]);
    const baby = result.rows[0];
    if (!baby) {
      return res.status(404).json({ error: 'Baby not found' });
    }
    res.status(200).json({ message: 'Baby deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
