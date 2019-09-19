var Db = require('../db/dbExec');
var responseFunc = require('./response');

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
    Db.querySELECTReceiptInfo(ARowReceiptInfo, function(err, result){
        if(err){
            res.send(err);
            return;
        }
        else{     
            if(result.length == 0){                
                ResResult = responseFunc.GetdialogRes(responseFunc.resType.DialogFinish, "병원정보와 MEMBERID에 매칭되는 정보가 없습니다.");
                res.send(ResResult);
                return;
            }
            else{
                Db.queryINSERT(SetReceiptInfo(result, ARowReceiptInfo, 0), function(err, resText){
                    if(err){
                        res.send(err);
                        return;
                    }
                    else{
                        ResResult = responseFunc.GetdialogRes(responseFunc.resType.DialogFinish, resText);
                        res.send(ResResult);
                        return;
                    }
                });
            }
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
            if(result.length == 0){                
                ResResult = responseFunc.GetdialogRes(responseFunc.resType.DialogFinish, "예약 내역이 존재하지 않습니다.");
                res.send(ResResult);
                return;
            }
            else{
                Db.queryINSERT(SetReceiptInfo(result, null, 1), function(err, resText){
                    if(err){
                        res.send(err);
                        return;
                    }
                    else{
                        var R_KEYList = new Array();
                        result.forEach(element => {
                            R_KEYList.push(element.R_KEY);
                        });
                        Db.queryUPDATERECEPTIONEdit(0, R_KEYList, function(err){
                            if(err)
                                console.log(err);
                            
                            ResResult = responseFunc.GetdialogRes(responseFunc.resType.DialogFinish, resText);
                            res.send(ResResult);
                            return;
                        });                        
                    }
                });
            }
        }
    });
};

function SetReceiptInfo(result, ARowReceiptInfo, State){
    var AReceiptInfo = {M_KEY:'', H_KEY:'', O_KEY:'', S_KEY:'', RECEPTION_TIME:'', RECEPTION_TIME_TEXT:'',
                         H_NAME:'', M_NAME:''};
    AReceiptInfo.M_KEY = result[0].M_KEY; 
    AReceiptInfo.H_KEY = result[0].H_KEY; 
    AReceiptInfo.O_KEY = result[0].O_KEY; 
    AReceiptInfo.H_NAME = result[0].H_NAME;
    AReceiptInfo.M_NAME = result[0].M_NAME;
    AReceiptInfo.S_KEY = State; 
    if(ARowReceiptInfo == null){
        var Reception_time = result[0].RECEPTION_TIME.toISOString();
        AReceiptInfo.RECEPTION_TIME = Reception_time.substr(0, 10) + 'T' + Reception_time.substr(11, 8) + 'Z';
        AReceiptInfo.RECEPTION_TIME_TEXT = Reception_time.substr(0, 10) + ' ' + Reception_time.substr(11, 8);
        AReceiptInfo.R_KEY = result[0].R_KEY; 
    }
    else{
        AReceiptInfo.RECEPTION_TIME = ARowReceiptInfo.date + 'T' + ARowReceiptInfo.time + 'Z';
        AReceiptInfo.RECEPTION_TIME_TEXT = ARowReceiptInfo.date + ' ' + ARowReceiptInfo.time; 
    }
    return AReceiptInfo;
}

exports.Checkreceipt = function(InMemberid, res){
    Db.querySELECTReceiptUnFinish(InMemberid, function(err, result){
        if(err){
            res.send(err);
            return;
        }
        else{
            if(result.length == 0){                
                ResResult = responseFunc.GetdialogRes(responseFunc.resType.DialogFinish, "예약 내역이 존재하지 않습니다.");
                res.send(ResResult);
                return;
            }
            else{                
                resText = responseFunc.GetReceiptResText(SetReceiptInfo(result, null, 0));  
                ResResult = responseFunc.GetdialogRes(responseFunc.resType.DialogFinish, resText);
                res.send(ResResult);
                return;
            }
        }
    });
}

exports.CheckNumOfWaitingPatients = function(InHospitalName, res){
    Db.querySELECTOFFICE(InHospitalName, function(err, result){
        if(err){
            res.send(err);
            return;
        }
        else{
            if(result.length == 0){                
                ResResult = responseFunc.GetdialogRes(responseFunc.resType.DialogFinish, "해당 요양기관에 대한 대기열정보가 존재하지 않습니다.");
                res.send(ResResult);
                return;
            }
            else{                
                resText = responseFunc.GetCNOPResText(SetOfficeInfoArray(result));  
                ResResult = responseFunc.GetdialogRes(responseFunc.resType.DialogFinish, resText);
                res.send(ResResult);
                return;
            }
        }
    });
};

function SetOfficeInfoArray(result){
    var AOfficeInfoArray = new Array();             
    var AOfficeInfo;

    result.forEach(element => {
        AOfficeInfo = new Object();
        AOfficeInfo.O_KEY = element.O_KEY;
        AOfficeInfo.O_NAME = element.O_NAME;
        AOfficeInfo.H_KEY = element.H_KEY;
        AOfficeInfo.PATIENT_COUNT = element.PATIENT_COUNT;
        AOfficeInfo.H_NAME = element.H_NAME;
        AOfficeInfoArray.push(AOfficeInfo);
    });
    
    return AOfficeInfoArray;
}

exports.getAgentReceiptList = function(req, res){
    var hosnum = req.body.hosnum;
    Db.querySELECTAgentReceiptList(hosnum, function(err, result){
        if(err){
            res.send(err);
            return;
        }
        else{
            if(result.length == 0){              
                res.send({});
                return;
            }
            else{
                var R_KEYList = new Array();
                result.forEach(element => {
                    R_KEYList.push(element.R_KEY);
                });
                Db.queryUPDATERECEPTIONEdit(1, R_KEYList, function(err){
                    if(err)
                        console.log(err);
                    
                    res.send(SetAgentReceiptInfoArray(result));
                    return;
                });
            }
        }
    });
};

function SetAgentReceiptInfoArray(result){
    var AReceiptInfoArray = new Array();             
    var AReceiptInfo;

    result.forEach(element => {
        AReceiptInfo = new Object();
                
        AReceiptInfo.operation = element.S_KEY;
        AReceiptInfo.createdAt = element.RECEPTION_TIME;
        AReceiptInfo._id = element.R_KEY;
        AReceiptInfo.hospital = element.H_KEY;
        AReceiptInfo.userId = element.M_KEY;
        AReceiptInfo.nationalInfo = element.FOREIGNER ? 1:0;
        AReceiptInfo.roomTitle = element.O_NAME;
        AReceiptInfo.userName = element.M_NAME;
        AReceiptInfo.userPhone = element.PHONE;
        AReceiptInfo.birthDate = element.BIRTHDAY;
        AReceiptInfo.gender = element.GENDER;        

        AReceiptInfoArray.push(AReceiptInfo);
    });
    
    return AReceiptInfoArray;
}

exports.updateNumOfWaitingPatients = function(req, res){
    var OfficeInfo = req.body;
    Db.queryUPDATENumOfWaitingPatients(OfficeInfo, function(err){
        if(err){
            res.send(err);
            return;
        }
        else{
            res.send('OK');
            return
        }
    });
};

exports.FinishReceip = function(req, res){
    var ReceiptInfo = new Object();
    ReceiptInfo.R_KEY= req.body.R_KEY;
    ReceiptInfo.S_KEY= 2;
    Db.queryINSERT(ReceiptInfo, function(err){
        if(err){
            console.log(err);
            res.send(err);
            return;
        }
        else{
            res.send('OK');
            return
        }
    });
};