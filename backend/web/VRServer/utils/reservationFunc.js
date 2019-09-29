var Db = require('../db/dbExec');
var responseFunc = require('./response');
var TypeConst = require('../Common/Const/TypeConst');

exports.MakeReservation = function(ARowReservationInfo, res){
    Db.querySELECTReservationInfo(ARowReservationInfo, function(err, result){
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
                AReservationInfo = SetReservationInfo(result, ARowReservationInfo, TypeConst.StateType.Reservation);
                Db.queryINSERT(AReservationInfo, function(err){
                    if(err){
                        res.send(err);
                        return;
                    }
                    else{
                        resText = responseFunc.GetReservationResText(AReservationInfo);
                        ResResult = responseFunc.GetdialogRes(TypeConst.resType.DialogFinish, resText);
                        res.send(ResResult);
                        return;
                    }
                });
            }
        }
    });
};

exports.CancelReservation = function(InMemberid, res){
    Db.querySELECTReservationUnFinish(InMemberid, function(err, result){
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
                AReservationInfo = SetReservationInfo(result, null, TypeConst.StateType.ReservationCancel);
                Db.queryINSERT(AReservationInfo, function(err){
                    if(err){
                        res.send(err);
                        return;
                    }
                    else{
                        var WORKLIST = new Array();
                        result.forEach(element => {
                            WORKLIST.push(element.WORKLIST_KEY);
                        });
                        Db.queryUPDATEReservationEdit(0, WORKLIST, function(err){
                            if(err)
                                console.log(err);
                            
                            resText = responseFunc.GetReservationResText(AReservationInfo);
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

function SetReservationInfo(result, ARowReservationInfo, State){
    var AReservationInfo = {MEMBER_KEY:'', HOSNUM:'', OFFICE_KEY:'', STATE_KEY:'', RECEPTION_TIME:'', RECEPTION_TIME_TEXT:'',
                         HOSNAME:'', MEMBER_NAME:''};
    AReservationInfo.MEMBER_KEY = result[0].MEMBER_KEY; 
    AReservationInfo.HOSNUM = result[0].HOSNUM; 
    AReservationInfo.OFFICE_KEY = result[0].OFFICE_KEY; 
    AReservationInfo.HOSNAME = result[0].HOSNAME;
    AReservationInfo.MEMBER_NAME = result[0].MEMBER_NAME;
    AReservationInfo.STATE_KEY = State; 
    if(ARowReservationInfo == null){
        var Reception_time = result[0].RECEPTION_TIME.toISOString();
        AReservationInfo.RECEPTION_TIME = Reception_time.substr(0, 10) + 'T' + Reception_time.substr(11, 8) + 'Z';
        var date = result[0].RECEPTION_TIME;
        AReservationInfo.RECEPTION_TIME_TEXT = date.getUTCFullYear() + '년' + (date.getUTCMonth()+1) + '월' + date.getUTCDate() + '일 ' 
                                            + date.getUTCHours() + '시';
        if (date.getUTCMinutes() != 0){
            AReservationInfo.RECEPTION_TIME_TEXT = AReservationInfo.RECEPTION_TIME_TEXT + date.getUTCMinutes() + '분';
        }
        AReservationInfo.WORKLIST_KEY = result[0].WORKLIST_KEY;
    }
    else{
        AReservationInfo.RECEPTION_TIME = ARowReservationInfo.date + 'T' + ARowReservationInfo.time + 'Z';
        var date = new Date(AReservationInfo.RECEPTION_TIME);
        AReservationInfo.RECEPTION_TIME_TEXT = date.getUTCFullYear() + '년' + (date.getUTCMonth()+1) + '월' + date.getUTCDate() + '일 ' 
                                            + date.getUTCHours() + '시';
        if (date.getUTCMinutes() != 0){
            AReservationInfo.RECEPTION_TIME_TEXT = AReservationInfo.RECEPTION_TIME_TEXT + date.getUTCMinutes() + '분';
        }
    }
    return AReservationInfo;
}

exports.CheckReservation = function(InMemberid, res){
    Db.querySELECTReservationUnFinish(InMemberid, function(err, result){
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
                resText = responseFunc.GetReservationResText(SetReservationInfo(result, null, TypeConst.StateType.Reservation));  
                ResResult = responseFunc.GetdialogRes(TypeConst.resType.DialogFinish, resText);
                res.send(ResResult);
                return;
            }
        }
    });
}

exports.getAgentReservationListCheck = function(req, res){
    console.log(req.body.R_KEY);
    var WORKLIST = req.body.WORKLIST;
    Db.queryUPDATEReservationEdit(1, WORKLIST, function(err){
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

exports.getAgentReservationList = function(req, res){
    var hosnum = req.body.hosnum;
    Db.querySELECTAgentReservationList(hosnum, function(err, result){
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
                res.send(SetAgentReservationInfoArray(result));
                return;
            }
        }
    });
};

function SetAgentReservationInfoArray(result){
    var AReservationInfoArray = new Array();             
    var AReservationInfo;

    result.forEach(element => {
        AReservationInfo = new Object();
                
        AReservationInfo.operation = element.STATE_KEY;
        AReservationInfo.createdAt = element.RECEPTION_TIME;
        AReservationInfo._id = element.WORKLIST_KEY;
        AReservationInfo.hospital = element.HOSNUM;
        AReservationInfo.userId = element.MEMBER_KEY;
        AReservationInfo.nationalInfo = element.FOREIGNER ? 1:0;
        AReservationInfo.roomTitle = element.OFFICE_NAME;
        AReservationInfo.userName = element.MEMBER_NAME;
        AReservationInfo.userPhone = element.PHONE;
        AReservationInfo.birthDate = element.BIRTHDAY;
        AReservationInfo.gender = element.GENDER;        

        AReservationInfoArray.push(AReservationInfo);
    });
    
    return AReservationInfoArray;
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

exports.FinishReservation = function(req, res){
    var ReservationInfo = new Object();
    ReservationInfo.WORKLIST_KEY= req.body.WORKLIST_KEY;
    ReservationInfo.STATE_KEY= TypeConst.StateType.ReservationFinish;
    Db.queryINSERT(ReservationInfo, function(err){
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