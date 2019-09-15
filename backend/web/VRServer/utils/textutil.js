var API_Call = require('./DFCall')('another');
var dialog = require('./dialogtest');
var receipt = require('./receiptFunc');
var response = require('./response');

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
            receipt.Makereceipt(SetReciptInfo(result.parameters.fields, TextBody["MEMBERID"]), res);
            return;
          }
          //예약취소
          case 'CancelReservation':{
            receipt.Cancelreceipt(TextBody["MEMBERID"], res);
            return;
          }
          //예약확인
          case 'CheckReservation':{
            return;
          }
          //대기열확인
          case 'CheckNumOfWaitingPatients':{
            return;
          }
          default:{
            ResResult = response.GetdialogRes(response.resType.DialogFinish, result.fulfillmentText);
            res.send(ResResult);
            return;
          }
        }
      }
      //대화 완료 X
      else{
        ResResult = response.GetdialogRes(response.resType.DialogUnFinish, result.fulfillmentText);
        res.send(ResResult);
        return;
      }      
    }
    else{
      ResResult = response.GetdialogRes(response.resType.error, '매칭되는 intent가 없습니다.');
      res.send(ResResult);
      return;
    }
  });
};

exports.dialogFlowStart = function(req, res){
  var TextBody = JSON.parse(req.body);
  dialog.ContextDelete(TextBody["MEMBERID"], function(dialogResult){
    var result = {dialogStart:dialogResult};
    res.send(result);
  });
};

function SetReciptInfo(RowParameters, memberId){
  var Parameters = {clinicName:'', date:'', time:'', patientId:''};
  Parameters["clinicName"] = RowParameters["ClinicName"].stringValue; 
  var datestr = RowParameters["time"].stringValue;
  Parameters["date"] = datestr.substr(0, 10); 
  Parameters["time"] = datestr.substr(11, 8); 
  Parameters["patientId"] = memberId;
  return Parameters;
}