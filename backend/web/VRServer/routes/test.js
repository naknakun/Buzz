var express = require('express');
var router = express.Router();
var request = require('request');

var reservationFunc = require('../utils/reservationFunc');
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
router.post('/getAgentReservationList', reservationFunc.getAgentReservationList);
//접수정보리스트 getCheck
router.post('/getAgentReservationListCheck', reservationFunc.getAgentReservationListCheck);
//대기열 정보 update
router.post('/updateNumOfWaitingPatients', reservationFunc.updateNumOfWaitingPatients);
//예약 완료 INSERT
router.post('/FinishReservation', reservationFunc.FinishReservation);

// 각 기능 테스트
router.post('/MakeReservation', function(req, res){
  var info = JSON.parse(req.body);
  reservationFunc.MakeReservation(info, res);
});
router.post('/CancelReservation', function(req, res){
  var info = JSON.parse(req.body);
  reservationFunc.CancelReservation(info.MEMBERID, res);
});
router.post('/CheckReservation', function(req, res){
  var info = JSON.parse(req.body);
  reservationFunc.CheckReservation(info.MEMBERID, res);
});
router.post('/CheckNumOfWaitingPatients', function(req, res){
  var info = JSON.parse(req.body);
  reservationFunc.CheckNumOfWaitingPatients(info["ClinicName"], res);
});

//app에서 text 전송 테스트
router.post('/SendText', TextFunc.calltext);
router.post('/SendText1', TextFunc.calltext1);
router.post('/gettext', TextFunc.getText);


module.exports = router;