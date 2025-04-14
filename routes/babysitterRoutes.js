const express = require('express');
const router = express.Router();
const babysitterController = require('../controller/babysitterController');

router.post('/add-babysitter', babysitterController.addBabysitter);

module.exports = router;

