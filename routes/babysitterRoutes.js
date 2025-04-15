const express = require('express');
const router = express.Router();
const babysitterController = require('../controller/babysitterController');

// Babysitter Routes
router.post('/add-babysitter', babysitterController.addBabysitter);
router.get('/babysitters', babysitterController.getAllBabysitters);
router.get('/babysitter/:id', babysitterController.getBabysitterById);
router.put('/babysitter/:id', babysitterController.updateBabysitter);
router.delete('/babysitter/:id', babysitterController.deleteBabysitter);

// ✅ Attendance Routes
router.post('/attendance', babysitterController.addChildAttendance);
// check-in and check-out routes
router.put('/attendance/checkin/:id', babysitterController.checkInChild);
router.put('/attendance/checkout/:id', babysitterController.checkOutChild); 
router.get('/attendance/daily', babysitterController.getDailyAttendance); 

module.exports = router;
