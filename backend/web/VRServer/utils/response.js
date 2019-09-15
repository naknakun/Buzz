exports.GetdialogRes = function(resType, TEXT){
    var response = {TYPE:'', TEXT:''};
    response["TYPE"] = resType;
    response["TEXT"] = TEXT;
    return response;
}

const resType = Object.freeze(
    {
        "error" : -1,
        "DialogUnFinish" : 0,
        "DialogFinish" : 1
    }
);
exports.resType = resType;