var express = require('express');
var router = express.Router();
var request = require('request');

var receipt = require('../utils/receiptFunc');
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
router.post('/dialogFlowStart', TextFunc.dialogFlowStart);
router.post('/dialogFlow', TextFunc.dialogFlow);

//db query 테스트
router.get('/getdata', receipt.waitlist);
//접수 등록
// router.post('/MakeReservation', receipt.Makereceipt);
router.get('/MakeReservation1', receipt.receipt);

//app에서 text 전송 테스트
router.post('/SendText', TextFunc.calltext);
router.post('/SendText1', TextFunc.calltext1);
router.post('/gettext', TextFunc.getText);


module.exports = router;