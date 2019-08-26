var express = require('express');
var router = express.Router();
var SignFunc = require('../utils/auth');
var TextFunc = require('../utils/textutil');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', SignFunc.sign);
router.get('/someapi', SignFunc.verify);
router.post('/SendText', TextFunc.calltext);

module.exports = router;
