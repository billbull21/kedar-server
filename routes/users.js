const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth/auth_controller');
const verifyToken = require('../middlewares/verifyToken');

router.get('/data/:username', verifyToken, authController.fetchUserByUsername);
router.put('/data/:username', verifyToken, authController.updateUser);
router.get('/all', verifyToken, authController.fetchAllUsers);
router.get('/', verifyToken, authController.fetchUserByToken);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/confirm/:confirmationCode', authController.confirm);

module.exports = router;
