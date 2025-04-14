// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { login, registerManager,logout } = require('../controller/userController');
const auth = require('../middleware/auth');

router.post('/register',registerManager);
router.post('/login', login);
router.post('/logout', logout);

module.exports = router;
