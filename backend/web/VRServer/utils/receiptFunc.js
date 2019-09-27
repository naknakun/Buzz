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
                        var WORKLIST = new Array();
                        result.forEach(element => {
                            WORKLIST.push(element.WORKLIST_KEY);
                        });
                        Db.queryUPDATERECEPTIONEdit(0, WORKLIST, function(err){
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
    var AReceiptInfo = {MEMBER_KEY:'', HOSNUM:'', OFFICE_KEY:'', STATE_KEY:'', RECEPTION_TIME:'', RECEPTION_TIME_TEXT:'',
                         HOSNAME:'', MEMBER_NAME:''};
    AReceiptInfo.MEMBER_KEY = result[0].MEMBER_KEY; 
    AReceiptInfo.HOSNUM = result[0].HOSNUM; 
    AReceiptInfo.OFFICE_KEY = result[0].OFFICE_KEY; 
    AReceiptInfo.HOSNAME = result[0].HOSNAME;
    AReceiptInfo.MEMBER_NAME = result[0].MEMBER_NAME;
    AReceiptInfo.STATE_KEY = State; 
    if(ARowReceiptInfo == null){
        var Reception_time = result[0].RECEPTION_TIME.toISOString();
        AReceiptInfo.RECEPTION_TIME = Reception_time.substr(0, 10) + 'T' + Reception_time.substr(11, 8) + 'Z';
        var date = result[0].RECEPTION_TIME;
        AReceiptInfo.RECEPTION_TIME_TEXT = date.getUTCFullYear() + '년' + (date.getUTCMonth()+1) + '월' + date.getUTCDate() + '일 ' 
                                            + date.getUTCHours() + '시' + date.getUTCMinutes() + '분';
        AReceiptInfo.WORKLIST_KEY = result[0].WORKLIST_KEY;
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
    var WORKLIST = req.body.R_KEY;
    Db.queryUPDATERECEPTIONEdit(1, WORKLIST, function(err){
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
        AOfficeInfo.OFFICE_KEY = element.OFFICE_KEY;
        AOfficeInfo.OFFICE_NAME = element.OFFICE_NAME;
        AOfficeInfo.HOSNUM = element.HOSNUM;
        AOfficeInfo.PATIENT_COUNT = element.PATIENT_COUNT;
        AOfficeInfo.HOSNAME = element.HOSNAME;
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
                
        AReceiptInfo.operation = element.STATE_KEY;
        AReceiptInfo.createdAt = element.RECEPTION_TIME;
        AReceiptInfo._id = element.WORKLIST;
        AReceiptInfo.hospital = element.HOSNUM;
        AReceiptInfo.userId = element.MEMBER_KEY;
        AReceiptInfo.nationalInfo = element.FOREIGNER ? 1:0;
        AReceiptInfo.roomTitle = element.OFFICE_NAME;
        AReceiptInfo.userName = element.MEMBER_NAME;
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
    ReceiptInfo.WORKLIST_KEY= req.body.R_KEY;
    ReceiptInfo.STATE_KEY= TypeConst.StateType.ReservationFinish;
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