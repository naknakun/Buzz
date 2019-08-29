var API_Call = require('./DFCall')('another');

exports.calltext = function(req, res){
    console.log(req.body.id + ', ' + req.body.text);
    if (req.body.id && req.body.text){
      res.send('제대로 전송되었습니다.');
    }
    else{
      res.send('받은 데이터가 읍어요');
    }
};

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