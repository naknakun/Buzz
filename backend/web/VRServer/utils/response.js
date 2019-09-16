var util = require("util");

exports.GetdialogRes = function(resType, TEXT){
    var response = {TYPE:'', TEXT:''};
    response["TYPE"] = resType;
    response["TEXT"] = TEXT;
    return response;
}

exports.GetCNOPResText = function(InOfficeInfoArray){
    var resTextBorn = "%s의 %s에 %s명 있습니다.";
    var resText;
    InOfficeInfoArray.array.forEach(element => {
        resText = resText + ' ' + util.format(resTextBorn,
                                              element.H_NAME,
                                              element.O_NAME,
                                              element.PATIENT_COUNT);
    });
    return resText;
}

exports.GetReceiptResText = function(ReceiptInfo){
    if(ReceiptInfo["S_KEY"] == 1)
        var resTextBorn = "%s님 %s에 %s에 예약 되었습니다.";
    else if(ReceiptInfo["S_KEY"] == 2)
        var resTextBorn = "%s님 %s에 %s에 예약취소 되었습니다."; 

    var resText = util.format(resTextBorn, 
                              ReceiptInfo["M_NAME"], 
                              ReceiptInfo["H_NAME"], 
                              ReceiptInfo["RECEPTION_TIME_TEXT"]);
    return resText;
}

const resType = Object.freeze(
    {
        "error" : -1,
        "DialogUnFinish" : 0,
        "DialogFinish" : 1
    }
);
exports.resType = resType;