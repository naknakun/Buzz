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

//agent 테스트
//접수정보리스트 get
router.post('/getAgentReceiptList', receipt.getAgentReceiptList);
//대기열 정보 update
router.post('/updateNumOfWaitingPatients', receipt.updateNumOfWaitingPatients);
//예약 완료 INSERT
router.post('/FinishReceip', receipt.FinishReceip);

//db query 테스트
router.get('/getdata', receipt.waitlist);
//접수 등록
// router.post('/MakeReservation', receipt.Makereceipt);
router.get('/MakeReservation1', receipt.receipt);


// 각 기능 테스트
router.post('/Makereceipt', function(req, res){
  var info = JSON.parse(req.body);
  receipt.Makereceipt(info, res);
});
router.post('/Cancelreceipt', function(req, res){
  var info = JSON.parse(req.body);
  receipt.Cancelreceipt(info.MEMBERID, res);
});
router.post('/Checkreceipt', function(req, res){
  var info = JSON.parse(req.body);
  receipt.Checkreceipt(info.MEMBERID, res);
});
router.post('/CheckNumOfWaitingPatients', function(req, res){
  var info = JSON.parse(req.body);
  receipt.CheckNumOfWaitingPatients(info["ClinicName"], res);
});

//app에서 text 전송 테스트
router.post('/SendText', TextFunc.calltext);
router.post('/SendText1', TextFunc.calltext1);
router.post('/gettext', TextFunc.getText);


module.exports = router;