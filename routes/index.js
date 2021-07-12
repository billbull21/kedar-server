var express = require('express');
var router = express.Router();

const verifyToken = require('../middlewares/verifyToken');

const classController = require('../controllers/class.controller');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/class', verifyToken, classController.fetchAll);
router.post('/class', verifyToken, classController.create);
router.put('/class/:id', verifyToken, classController.update);
router.delete('/class/:id', verifyToken, classController.del);

module.exports = router;
