var express = require('express');
var router = express.Router();
var SignFunc = require('../utils/auth');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Buzz' });
});

router.get('/login', SignFunc.sign);
router.get('/someapi', SignFunc.verify);

module.exports = router;
