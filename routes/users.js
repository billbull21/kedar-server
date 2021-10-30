const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth/auth_controller');
const verifyToken = require('../middlewares/verifyToken');

router.get('/:username', authController.fetchUserByUsername);
router.put('/:username', verifyToken, authController.updateUser);
router.get('/all', authController.fetchAllUsers);
router.get('/', authController.fetchUserByToken);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/confirm/:confirmationCode', authController.confirm);

module.exports = router;
