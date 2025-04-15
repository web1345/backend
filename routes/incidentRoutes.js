const express = require('express');
const router = express.Router();
const {
  createIncident,
  getAllIncidents,
} = require('../controller/incidentController');

router.post('/report', createIncident);
router.get('/incidents', getAllIncidents);

module.exports = router;
