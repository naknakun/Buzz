var express = require('express');
var router = express.Router();
var request = require('request');

var dialogtest = require('../utils/dialogtest');
var Db = require('../db/dbExec');
var TextFunc = require('../utils/textutil');

//request.get 테스트
router.get('/test', function(req, res){
    request.get(
        {
        url:'https://jsonplaceholder.typicode.com/users',
            strictSSL: false
        }, 
        function(error, response, body){
        if (error){
            res.send(error);
        }
        else{
            res.json(JSON.parse(body));
        }        
        }
    );
});

//request.post 테스트
router.get('/test1', function(req, res){
    request.post(
      {
        url:'https://jsonplaceholder.typicode.com/users',
        strictSSL: false
      }, 
      function(error, response, body){
        if (error){
          res.send(error);
        }
        else{
          res.json(JSON.parse(body));
        }     
      }
    );
});

//dialog flow call 테스트
router.get('/dialogtest', function(req, res){
    dialogtest.test(res);
});

//db query 테스트
router.get('/getdata', Db.query);

//app에서 text 전송 테스트
router.post('/SendText', TextFunc.calltext);
router.post('/SendText1', TextFunc.calltext1);
router.post('/gettext', TextFunc.getText);


module.exports = router;