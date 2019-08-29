var request = require('request');

module.exports = function(){
    function API_Call() {
        var OPTIONS = {};
        // var OPTIONS = {
        //     headers: 
        //     {
        //         'Content-Type': 'application/json',
        //         'charset': 'utf-8',
        //         'Authorization': 'Bearer ya29.c.ElpxBxm8_H4c5gJ5FmOs6ONqQ24hui908LGczGYJLOiTNoow-Qe3UzUJdyqW_aIizpgimm5DkW-rwxKdy1djetzOjiLvdw87B5edecM983mqJ2Qmn9DoDsjQkOw'
        //     }
        // };
        var HOST = 'https://dialogflow.googleapis.com';
        // (function () {
        //     switch (callee) {
        //         case 'dev':
        //             HOST = 'https://dev-api.com';
        //             break;
        //         case 'prod':
        //             HOST = 'https://prod-api.com';
        //             break;
        //         case 'another':
        //             HOST = 'http://localhost';
        //             break;
        //         default:
        //             HOST = 'http://localhost';
        //     }
        // })(callee);
        return {
            Calldialogflow : function (text, callback) {
                //OPTIONS.url = HOST + '/v2/projects/buzz-yigwxu/agent/sessions/2881ea9c-64c2-62dd-574e-3ab3bb2063f1:detectIntent';
                OPTIONS.url = 'https://jsonplaceholder.typicode.com/users';
                OPTIONS.strictSSL= false;
                //OPTIONS.strictSSL = false;
                // OPTIONS.body = JSON.stringify({
                //     "queryInput":
                //     {
                //         "text":
                //         {
                //             "text":text,
                //             "languageCode":"ko"
                //         }
                //     },
                //     "queryParams":
                //     {
                //         "timeZone":"Asia\\Seoul"
                //     }
                // });
                request.post(OPTIONS, function (err, res, result) {
                    if (err){
                        callback('error:' + err, result);
                        console.log(err);
                    }
                    else{
                        statusCodeErrorHandler(res.statusCode, callback, result);
                    }                    
                });
            }
        };
    }
    function statusCodeErrorHandler(statusCode, callback , data) {
        switch (statusCode) {
            case 200,201:
                callback(null, JSON.parse(data));
                break;
            default:
                callback('error:' + statusCode, null);
                break;
        }
    }
    var INSTANCE;
    if (INSTANCE === undefined) {
        INSTANCE = new API_Call();
    }
    return INSTANCE;
  };