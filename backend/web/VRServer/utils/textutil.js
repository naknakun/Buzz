const uuid = require('uuid');

var API_Call = require('./DFCall')('another');
var dialog = require('../utils/dialogtest');
var receipt = require('../utils/receiptFunc');

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

exports.dialogFlowSetUUID = function(req, res){
  var TextBody = JSON.parse(req.body);
  // A unique identifier for the given session
  var InUUID = uuid.v4();
  dialog.flow(InUUID, TextBody["TEXT"], function(RowResult){
    if(RowResult.intent){
      receipt.Makereceipt(RowResult, res);      
    }
    else
      res.send("매칭되는 intent가 없습니다.");
  });
};

exports.dialogFlow = function(req, res){
  var TextBody = JSON.parse(req.body);
  dialog.flow(TextBody["sessionId"], TextBody["TEXT"], function(result){
    res.send(result);
  });
};