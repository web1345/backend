const Incident = require('../model/Incident');
const { sendEmail } = require('../utils/mailer');
const pool = require('../config/db');

const createIncident = async (req, res) => {
    try {
      const {
        child_name,
        incident_type,
        date,
        time,
        description,
        severity,
        babysitter_id
      } = req.body;
  
      // Get babysitter's info from babysitters table
      let babysitterName = 'Unknown';
      if (babysitter_id) {
        const result = await pool.query(
          'SELECT first_name, last_name FROM babysitters WHERE id = $1',
          [babysitter_id]
        );
  
        if (result.rows.length > 0) {
          const { first_name, last_name } = result.rows[0];
          babysitterName = `${first_name} ${last_name}`;
        }
      }
  
      // Create the incident
      const insertIncident = await pool.query(
        `INSERT INTO incidents 
          (child_name, incident_type, date, time, description, severity, babysitter_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [child_name, incident_type, date, time, description, severity, babysitter_id]
      );
  
      const incident = insertIncident.rows[0];
  
      // Prepare email content
      const subject = `🚨 New Incident Report for ${child_name}`;
      const text = `
        Incident Report
  
        Child: ${child_name}
        Type: ${incident_type}
        Date: ${date}
        Time: ${time}
        Severity: ${severity}
        Description: ${description}
        Babysitter: ${babysitterName}
      `;
  
      const html = `
        <h3>🚨 New Incident Report</h3>
        <p><strong>Child:</strong> ${child_name}</p>
        <p><strong>Type:</strong> ${incident_type}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Severity:</strong> ${severity}</p>
        <p><strong>Description:</strong><br>${description}</p>
        <p><strong>Babysitter:</strong> ${babysitterName}</p>
      `;
  
      // Send email
      await sendEmail({
        to: 'daystardaycareapp@gmail.com',
        subject,
        text,
        html,
      });
  
      res.status(201).json({
        message: 'Incident reported and email sent',
        incident: {
          ...incident,
          babysitter_name: babysitterName
        }
      });
    } catch (err) {
      console.error('Error creating incident:', err);
      res.status(500).json({ message: 'Failed to report incident' });
    }
  };
  
const getAllIncidents = async (req, res) => {
  try {
    const incidents = await Incident.getAll();
    res.status(200).json(incidents);
  } catch (err) {
    console.error('Error fetching incidents:', err);
    res.status(500).json({ message: 'Failed to retrieve incidents' });
  }
};

module.exports = { createIncident, getAllIncidents };
