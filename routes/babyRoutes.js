const express = require('express');
const router = express.Router();
const babyController = require('../controller/babyController');

// Route for adding a new baby (Create)
router.post('/addbaby', babyController.addBaby);

// Route for getting all babies (Read)
router.get('/babies', babyController.getAllBabies);

// Route for getting a single baby by ID (Read)
router.get('/baby/:id', babyController.getBabyById);

// Route for updating a baby's details (Update)
router.put('/baby/:id', babyController.updateBaby);

// Route for deleting a baby (Delete)
router.delete('/baby/:id', babyController.deleteBaby);

module.exports = router;
