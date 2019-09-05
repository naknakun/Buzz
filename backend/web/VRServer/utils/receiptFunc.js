var Db = require('../db/dbExec');

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

exports.Makereceipt = function(req, res){
    var ARowReceiptInfo = JSON.parse(req.body);
    Db.querySELECTReceiptInfo(ARowReceiptInfo, function(err, result){
        if(err){
            res.send(err);
        }
        else{     
            Db.queryINSERT(SetReceiptInfo(result, ARowReceiptInfo), function(err){
                if(err){
                    res.send(err);
                }
                else{
                    res.send('정상 등록되었습니다.');                    
                }
            });
        }
    });
};

function SetReceiptInfo(result, ARowReceiptInfo){
    var AReceiptInfo = {M_KEY:'', H_KEY:'', O_KEY:'', S_KEY:'', RECEPTION_TIME:''};
    AReceiptInfo["M_KEY"] = result[0]["M_KEY"]; 
    AReceiptInfo["H_KEY"] = result[0]["H_KEY"]; 
    AReceiptInfo["O_KEY"] = result[0]["O_KEY"]; 
    AReceiptInfo["S_KEY"] = 1; 
    AReceiptInfo["RECEPTION_TIME"] = ARowReceiptInfo["date"] + 'T' + ARowReceiptInfo["time"] + 'Z';
    return AReceiptInfo;
}