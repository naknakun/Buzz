var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES; 
var util = require("util");

var Dbcon = require('./dbCon');

exports.querySELECTReceiptInfo = function(InRowReceiptInfo, response){    
    var connection = new Connection(Dbcon.config);
    connection.on('connect', function(err){
        if(err){
            response(err);
        }
        else{
            var queryString = `
                                SELECT
                                    H.H_KEY, M.M_KEY, O.O_KEY, H.H_NAME, M.M_NAME
                                FROM
                                    [HOSPITAL] H, [MEMBER] M, [OFFICE] O
                                WHERE
                                    H.H_NAME = '%s'
                                    AND M.M_ID = '%s'
                                    AND O.O_NAME = '%s'                            
                                `;
            var query = util.format(queryString, InRowReceiptInfo["clinicName"], InRowReceiptInfo["patientId"], '진료실');
            executeSELECT(connection, query, function(error, results) {
                if(error){
                    response(error);
                }
                else{
                    var json = results;
                    response(null, json);
                }
            });
        }
    });    
};

exports.querySELECTUnFinish = function(AMemberInfo, response){    
    var connection = new Connection(Dbcon.config);
    connection.on('connect', function(err){
        if(err){
            response(err);
        }
        else{
            var queryString = `
                                SELECT
                                    H.H_KEY, M.M_KEY, O.O_KEY, H.H_NAME, M.M_NAME
                                FROM
                                    [HOSPITAL] H, [MEMBER] M, [OFFICE] O
                                WHERE
                                    H.H_NAME = '%s'
                                    AND M.M_ID = '%s'
                                    AND O.O_NAME = '%s'                            
                                `;
            var query = util.format(queryString, InRowReceiptInfo["clinicName"], InRowReceiptInfo["patientId"], '진료실');
            executeSELECT(connection, query, function(error, results) {
                if(error){
                    response(error);
                }
                else{
                    var json = results;
                    response(null, json);
                }
            });
        }
    });    
};

exports.querySELECT = function(tname, response){    
    var connection = new Connection(Dbcon.config);
    connection.on('connect', function(err){
        if(err){
            response(err);
        }
        else{            
            var queryString = `
                                SELECT
                                    *
                                FROM
                                    [%s]                           
                                `;
            var query = util.format(queryString, tname);
            executeSELECT(connection, query, function(error, results) {
                if(error){
                    response(error);
                }
                else{
                    var json = JSON.stringify(results);
                    response(null, json);
                }
            });
        }
    });    
};

exports.queryINSERT = function(InReceiptInfo, response){
    var connection = new Connection(Dbcon.config);
    connection.on('connect', function(err){
        if(err){
            response(err);
        }
        else{
            executeINSERT(connection, InReceiptInfo, function(error) {
                if(error){
                    response(error);
                }
                else{
                    var resTextBorn = "%s님 %s에 %s에 예약 되었습니다.";
                    var resText = util.format(resTextBorn, 
                                              InReceiptInfo["M_NAME"], 
                                              InReceiptInfo["H_NAME"], 
                                              InReceiptInfo["RECEPTION_TIME_TEXT"]);
                    response(null, resText);
                }
            });
        }
    });    
};

function executeSELECT(connection, query, callback) {
    var results = [];

    var request = new Request(
        query, 
        function(error) {
            if (error) {
                return callback(error);
            }
            callback(null, results);
        }
    );

    request.on('row', function(columns) {
        var row = {};
        columns.forEach(function (column){
            row[column.metadata.colName] = column.value;            
        });
        console.log(row);
        results.push(row);        
    });
    connection.execSql(request);
}

function executeINSERT(connection, InReceiptInfo, callback) {
    var query = `
    INSERT INTO [DBO].[RECEPTION]
    (
        M_KEY, 
        H_KEY, 
        O_KEY, 
        S_KEY, 
        RECEPTION_TIME
    ) 
    VALUES 
    (
        @M_KEY, 
        @H_KEY, 
        @O_KEY, 
        @S_KEY, 
        @RECEPTION_TIME
    );`
    var request = new Request(
        query, 
        function(error) {
            if (error) {
                return callback(error);
            }
            callback(null);
        }
    );
    request.addParameter('M_KEY', TYPES.Int, InReceiptInfo["M_KEY"]);  
    request.addParameter('H_KEY', TYPES.NVarChar, InReceiptInfo["H_KEY"]);  
    request.addParameter('O_KEY', TYPES.Int, InReceiptInfo["O_KEY"]);  
    request.addParameter('S_KEY', TYPES.Int, InReceiptInfo["S_KEY"]);  
    request.addParameter('RECEPTION_TIME', TYPES.DateTime, new Date(InReceiptInfo["RECEPTION_TIME"]));
    connection.execSql(request);
}