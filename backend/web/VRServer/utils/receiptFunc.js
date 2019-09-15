var Db = require('../db/dbExec');
var response = require('./response');

exports.waitlist = function(req, res){
    Db.querySELECT('OFFICE', function(err, result){
        if(err){
            res.send(err);
        }
        else{
            res.send(result);
        }
    });
};

exports.receipt = function(req, res){
    Db.queryINSERT(function(err){
        if(err){
            res.send(err);
        }
        else{
            res.send('정상 등록되었습니다.');
        }
    });
};

exports.Makereceipt = function(ARowReceiptInfo, res){
    // var ARowReceiptInfo = JSON.parse(req.body);
    Db.querySELECTReceiptInfo(ARowReceiptInfo, function(err, result){
        if(err){
            res.send(err);
            return;
        }
        else{     
            Db.queryINSERT(SetReceiptInfo(result, ARowReceiptInfo, 1), function(err, resText){
                if(err){
                    res.send(err);
                    return;
                }
                else{
                    ResResult = response.GetdialogRes(response.resType.DialogFinish, resText);
                    res.send(ResResult);
                    return;
                }
            });
        }
    });
};

exports.Cancelreceipt = function(InMemberid, res){
    Db.querySELECTReceiptUnFinish(InMemberid, function(err, result){
        if(err){
            res.send(err);
            return;
        }
        else{     
            Db.queryINSERT(SetReceiptInfo(result, null, 2), function(err, resText){
                if(err){
                    res.send(err);
                    return;
                }
                else{
                    ResResult = response.GetdialogRes(response.resType.DialogFinish, resText);
                    res.send(ResResult);
                    return;
                }
            });
        }
    });
};

function SetReceiptInfo(result, ARowReceiptInfo, State){
    var AReceiptInfo = {M_KEY:'', H_KEY:'', O_KEY:'', S_KEY:'', RECEPTION_TIME:'', RECEPTION_TIME_TEXT:'',
                         H_NAME:'', M_NAME:''};
    AReceiptInfo["M_KEY"] = result[0]["M_KEY"]; 
    AReceiptInfo["H_KEY"] = result[0]["H_KEY"]; 
    AReceiptInfo["O_KEY"] = result[0]["O_KEY"]; 
    AReceiptInfo["H_NAME"] = result[0]["H_NAME"];
    AReceiptInfo["M_NAME"] = result[0]["M_NAME"];
    AReceiptInfo["S_KEY"] = State; 
    if(ARowReceiptInfo == null){
        var Reception_time = result[0]["RECEPTION_TIME"].toISOString();
        AReceiptInfo["RECEPTION_TIME"] = Reception_time.substr(0, 10) + 'T' + Reception_time.substr(11, 8) + 'Z';
        AReceiptInfo["RECEPTION_TIME_TEXT"] = Reception_time.substr(0, 10) + ' ' + Reception_time.substr(11, 8); 
    }
    else{
        AReceiptInfo["RECEPTION_TIME"] = ARowReceiptInfo["date"] + 'T' + ARowReceiptInfo["time"] + 'Z';
        AReceiptInfo["RECEPTION_TIME_TEXT"] = ARowReceiptInfo["date"] + ' ' + ARowReceiptInfo["time"]; 
    }
    return AReceiptInfo;
}

exports.UnFinishReceipt = function(req, res){
    var AMemberInfo = JSON.parse(req.body);
    Db.querySELECTUnFinish(AMemberInfo, function(err, result){
        if(err){
            res.send(err);
        }
        else{
            res.send(result);
        }
    });
}