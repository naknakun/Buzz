var util = require("util");

var TypeConst = require("../Common/Const/TypeConst");

exports.GetdialogRes = function(resType, TEXT){
    var response = {TYPE:'', TEXT:''};
    response.TYPE = resType;
    response.TEXT = TEXT;
    return response;
}

exports.GetCNOPResText = function(InOfficeInfoArray){
    var resTextBorn = "%s의 %s에 %s명 있습니다.";
    var resText = "";
    InOfficeInfoArray.forEach(element => {
        resText = resText + util.format(resTextBorn,
                                        element.HOSNAME,
                                        element.OFFICE_NAME,
                                        element.PATIENT_COUNT) + " ";
    });
    return resText.trim();
}

exports.GetReservationResText = function(ReservationInfo){
    if(ReservationInfo.STATE_KEY == TypeConst.StateType.Reservation)
        var resTextBorn = "%s님 %s에 %s에 예약 되었습니다.";
    else if(ReservationInfo.STATE_KEY == TypeConst.StateType.ReservationCancel)
        var resTextBorn = "%s님 %s에 %s에 예약취소 되었습니다."; 

    var resText = util.format(resTextBorn, 
                              ReservationInfo.MEMBER_NAME, 
                              ReservationInfo.HOSNAME, 
                              ReservationInfo.RECEPTION_TIME_TEXT);
    return resText;
}