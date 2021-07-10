const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth/auth_controller');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/confirm/:confirmationCode', authController.confirm);

module.exports = router;
