// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { login, registerManager,logout,getAllUsers } = require('../controller/userController');
const auth = require('../middleware/auth');

router.post('/register',registerManager);
router.post('/login', login);
router.post('/logout', logout);
router.get('/allusers',getAllUsers); 


module.exports = router;
