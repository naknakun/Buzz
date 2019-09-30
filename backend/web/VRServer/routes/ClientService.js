var express = require('express');
var router = express.Router();

var reservationFunc = require('../utils/reservationFunc');
var TextFunc = require('../utils/textutil');

//dialog flow call
router.post('/dialogFlowStart', TextFunc.dialogFlowStart);
router.post('/dialogFlow', TextFunc.dialogFlow);

//agent
//접수정보리스트 get
router.post('/getAgentReservationList', reservationFunc.getAgentReservationList);
//접수정보리스트 getCheck
router.post('/getAgentReservationListCheck', reservationFunc.getAgentReservationListCheck);
//대기열 정보 update
router.post('/updateNumOfWaitingPatients', reservationFunc.updateNumOfWaitingPatients);
//예약 완료 INSERT
router.post('/FinishReservation', reservationFunc.FinishReservation);

module.exports = router;