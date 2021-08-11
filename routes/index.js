var express = require('express');
var router = express.Router();

const verifyToken = require('../middlewares/verifyToken');

const classController = require('../controllers/class.controller');
const tClassUsersController = require('../controllers/t_class_users.controller');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/master/class', verifyToken, classController.fetchAll);
router.post('/master/class', verifyToken, classController.create);
router.put('/master/class/:id', verifyToken, classController.update);
router.delete('/master/class/:id', verifyToken, classController.del);

router.get('/class', verifyToken, tClassUsersController.fetchAll);
router.post('/class', verifyToken, tClassUsersController.create);
router.delete('/class/:id', verifyToken, tClassUsersController.del);

module.exports = router;
