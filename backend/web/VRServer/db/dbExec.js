var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES; 
var util = require("util");

var responseFunc = require('../utils/response');
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

exports.querySELECTReceiptUnFinish = function(InMemberid, response){    
    var connection = new Connection(Dbcon.config);
    connection.on('connect', function(err){
        if(err){
            response(err);
        }
        else{
            var queryString = `
                                SELECT
                                    TOP 1 H_KEY, M_KEY, O_KEY, RECEPTION_TIME,
                                    (SELECT H_NAME FROM HOSPITAL WHERE H_KEY = R.H_KEY) AS H_NAME,
                                    (SELECT M_NAME FROM MEMBER WHERE M_ID = '%s') AS M_NAME
                                FROM
                                    [RECEPTION] R
                                WHERE
                                    (M_KEY = (SELECT M_KEY FROM MEMBER WHERE M_ID = '%s'))
                                    AND (RECEPTION_FINISH = 0)
                                    AND (S_KEY = 1)
                                ORDER BY
                                    RECEPTION_TIME DESC;                       
                                `;
            var query = util.format(queryString, InMemberid, InMemberid);
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

exports.querySELECTOFFICE = function(InHospitalKey, response){    
    var connection = new Connection(Dbcon.config);
    connection.on('connect', function(err){
        if(err){
            response(err);
        }
        else{
            var queryString = `
                                SELECT
                                    O_KEY,
                                    O_NAME,
                                    H_KEY,
                                    PATIENT_COUNT,
                                    H_NAME
                                FROM
                                    [OFFICE] O
                                INNER JOIN
                                    [HOSPITAL] H
                                WHERE
                                    (H.H_NAME = '%s')
                                    AND (CONVERT(char(10), LAST_UPDATE_DATE, 126) =
                                        CONVERT(char(10), [DBO].[dReturnDate](getdate()),126))
                                ORDER BY
                                    O_KEY;                      
                                `;
            var query = util.format(queryString, InHospitalKey);
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
                    resText = responseFunc.GetReceiptResText(InReceiptInfo);                    
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