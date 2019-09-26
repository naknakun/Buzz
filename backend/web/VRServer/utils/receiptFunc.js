var Db = require('../db/dbExec');
var responseFunc = require('./response');
var TypeConst = require('../Common/Const/TypeConst');

exports.Makereceipt = function(ARowReceiptInfo, res){
    Db.querySELECTReceiptInfo(ARowReceiptInfo, function(err, result){
        if(err){
            res.send(err);
            return;
        }
        else{     
            if(result.length == 0){                
                ResResult = responseFunc.GetdialogRes(TypeConst.resType.DialogFinish, "병원정보와 MEMBERID에 매칭되는 정보가 없습니다.");
                res.send(ResResult);
                return;
            }
            else{
                AReceiptInfo = SetReceiptInfo(result, ARowReceiptInfo, TypeConst.StateType.Reservation);
                Db.queryINSERT(AReceiptInfo, function(err){
                    if(err){
                        res.send(err);
                        return;
                    }
                    else{
                        resText = responseFunc.GetReceiptResText(AReceiptInfo);
                        ResResult = responseFunc.GetdialogRes(TypeConst.resType.DialogFinish, resText);
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
                ResResult = responseFunc.GetdialogRes(TypeConst.resType.DialogFinish, "예약 내역이 존재하지 않습니다.");
                res.send(ResResult);
                return;
            }
            else{
                AReceiptInfo = SetReceiptInfo(result, null, TypeConst.StateType.ReservationCancel);
                Db.queryINSERT(AReceiptInfo, function(err){
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
                            
                            resText = responseFunc.GetReceiptResText(AReceiptInfo);
                            ResResult = responseFunc.GetdialogRes(TypeConst.resType.DialogFinish, resText);
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
        var date = result[0].RECEPTION_TIME;
        AReceiptInfo.RECEPTION_TIME_TEXT = date.getUTCFullYear() + '년' + (date.getUTCMonth()+1) + '월' + date.getUTCDate() + '일 ' 
                                            + date.getUTCHours() + '시' + date.getUTCMinutes() + '분';
        AReceiptInfo.R_KEY = result[0].R_KEY;
    }
    else{
        AReceiptInfo.RECEPTION_TIME = ARowReceiptInfo.date + 'T' + ARowReceiptInfo.time + 'Z';
        var date = new Date(AReceiptInfo.RECEPTION_TIME);
        AReceiptInfo.RECEPTION_TIME_TEXT = date.getUTCFullYear() + '년' + (date.getUTCMonth()+1) + '월' + date.getUTCDate() + '일 ' 
                                            + date.getUTCHours() + '시' + date.getUTCMinutes() + '분';
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
                ResResult = responseFunc.GetdialogRes(TypeConst.resType.DialogFinish, "예약 내역이 존재하지 않습니다.");
                res.send(ResResult);
                return;
            }
            else{                
                resText = responseFunc.GetReceiptResText(SetReceiptInfo(result, null, TypeConst.StateType.Reservation));  
                ResResult = responseFunc.GetdialogRes(TypeConst.resType.DialogFinish, resText);
                res.send(ResResult);
                return;
            }
        }
    });
}

exports.getAgentReceiptListCheck = function(req, res){
    console.log(req.body.R_KEY);
    var R_KEYList = req.body.R_KEY;
    Db.queryUPDATERECEPTIONEdit(1, R_KEYList, function(err){
        if(err){
            console.log(err);
            res.send('FAIL');
            return;
        }
        res.send('OK');
        return;
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
                ResResult = responseFunc.GetdialogRes(TypeConst.resType.DialogFinish, "해당 요양기관에 대한 대기열정보가 존재하지 않습니다.");
                res.send(ResResult);
                return;
            }
            else{                
                resText = responseFunc.GetCNOPResText(SetOfficeInfoArray(result));  
                ResResult = responseFunc.GetdialogRes(TypeConst.resType.DialogFinish, resText);
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
                res.send(SetAgentReceiptInfoArray(result));
                return;
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

exports.FinishReceipt = function(req, res){
    var ReceiptInfo = new Object();
    ReceiptInfo.R_KEY= req.body.R_KEY;
    ReceiptInfo.S_KEY= TypeConst.StateType.ReservationFinish;
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