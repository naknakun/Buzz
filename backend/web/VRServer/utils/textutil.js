var API_Call = require('./DFCall')('another');
var dialog = require('./dialogFlowFunc');
var reservationFunc = require('./reservationFunc');
var responseFunc = require('./response');
var TypeConst = require('../Common/Const/TypeConst');

exports.calltext = function(req, res){
    console.log(req.body.id + ', ' + req.body.text);
    if (req.body.id && req.body.text){
      res.send('제대로 전송되었습니다.');
    }
    else{
      res.send('받은 데이터가 읍어요');
    }
};

exports.calltext1 = function(req, res){
  var obj = JSON.parse(req.body);
  console.log(obj["clinicName"]);
  res.send(obj);
};

//rest api call 테스트
exports.getText = function(req, res){
  var text = req.body.text
  API_Call.Calldialogflow(text, function (err, result) {
      if (!err) {
          res.send(result);
      } else {
          res.send(err);
      }
  });
};

exports.dialogFlow = function(req, res){
  var TextBody = JSON.parse(req.body);
  dialog.flow(TextBody["MEMBERID"], TextBody["TEXT"], function(result){
    if(result.intent){
      //대화 완료 O
      if(result.allRequiredParamsPresent){
        switch(result.intent.displayName){
          //예약요청 
          case 'MakeReservation':{
            reservationFunc.MakeReservation(SetReservationInfo(result.parameters.fields, TextBody["MEMBERID"]), res);
            return;
          }
          //예약취소
          case 'CancelReservation':{
            reservationFunc.CancelReservation(TextBody["MEMBERID"], res);
            return;
          }
          //예약확인
          case 'CheckReservation':{
            reservationFunc.CheckReservation(TextBody["MEMBERID"], res);
            return;
          }
          //대기열확인
          case 'CheckNumOfWaitingPatients':{
            reservationFunc.CheckNumOfWaitingPatients(result.parameters.fields["ClinicName"].stringValue, res);
            return;
          }
          default:{
            ResResult = responseFunc.GetdialogRes(TypeConst.resType.DialogFinish, result.fulfillmentText);
            res.send(ResResult);
            return;
          }
        }
      }
      //대화 완료 X
      else{
        ResResult = responseFunc.GetdialogRes(TypeConst.resType.DialogUnFinish, result.fulfillmentText);
        res.send(ResResult);
        return;
      }      
    }
    else{
      ResResult = responseFunc.GetdialogRes(TypeConst.resType.error, '매칭되는 intent가 없습니다.');
      res.send(ResResult);
      return;
    }
  });
};

exports.dialogFlowStart = function(req, res){
  var TextBody = JSON.parse(req.body);
  dialog.ContextDelete(TextBody.MEMBERID, function(dialogResult){
    var result = {dialogStart:dialogResult};
    res.send(result);
  });
};

function SetReservationInfo(RowParameters, memberId){
  var Parameters = {clinicName:'', date:'', time:'', patientId:''};
  Parameters.clinicName = RowParameters.ClinicName.stringValue; 
  var datestr = RowParameters.date.stringValue;
  var timestr = RowParameters.time.stringValue;
  Parameters.date = datestr.substr(0, 10); 
  Parameters.time = timestr.substr(11, 8); 
  Parameters.MEMBERID = memberId;
  return Parameters;
}