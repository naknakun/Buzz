var express = require('express');
var router = express.Router();
var SignFunc = require('../utils/auth');
var TextFunc = require('../utils/textutil');
var Db = require('../db/dbExec');

var request = require('request');
var test = require('../utils/test');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Buzz' });
});

router.get('/login', SignFunc.sign);
router.get('/someapi', SignFunc.verify);
router.post('/SendText', TextFunc.calltext);
router.get('/getdata', Db.query);
router.post('/gettext', TextFunc.getText);

router.get('/test', function(req, res){
  request.get(
    {
      url:'https://pokeapi.co/api/v2/pokemon/pikachu/',
      strictSSL: false
    }, 
    function(error, response, body){
      res.json(JSON.parse(body));
    }
  );
});

router.get('/test1', function(req, res){
  request.post(
    {
      url:'https://jsonplaceholder.typicode.com/users',
      strictSSL: false
    }, 
    function(error, response, body){
      res.json(JSON.parse(body));
    }
  );
});

router.get('/api', function(req, res){
  test.test();
});

module.exports = router;
