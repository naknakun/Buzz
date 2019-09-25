var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES; 
var util = require("util");

var responseFunc = require('../utils/response');
var Dbcon = require('./dbCon');
var TypeConst = require("../Common/Const/TypeConst");

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
            var query = util.format(queryString, InRowReceiptInfo.clinicName, InRowReceiptInfo.MEMBERID, '진료실');
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
                                    TOP 1 R.R_KEY, R.H_KEY, R.M_KEY, O_KEY, RECEPTION_TIME,
                                    H_NAME, M_NAME, S_KEY
                                FROM
                                    RECEPTION R
                                 INNER JOIN
                                    HOSPITAL H
                                ON 
                                    R.H_KEY = H.H_KEY
                                INNER JOIN 
                                    MEMBER M
                                ON
                                    R.M_KEY = M.M_KEY
                                INNER JOIN
                                    (SELECT 
                                        TMPRR.RR_KEY,
                                        TMPRR.R_KEY,
                                        TMPRR.S_KEY,
                                        TMPRR.REQUEST_TIME
                                    FROM
                                        RECEPTION_RESULT AS TMPRR
                                    INNER JOIN	
                                        (SELECT 
                                            R_KEY, MAX(REQUEST_TIME) AS REQUEST_TIME
                                        FROM 
                                            RECEPTION_RESULT
                                        GROUP BY
                                            R_KEY) AS G_RR
                                    ON
                                        TMPRR.REQUEST_TIME = G_RR.REQUEST_TIME) AS RR
                                ON
                                    R.R_KEY = RR.R_KEY
                                WHERE
                                    (M.M_ID = '%s')
                                    AND (S_KEY = 0)
                                ORDER BY
                                    RECEPTION_TIME DESC;                     
                                `;
            var query = util.format(queryString, InMemberid);
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

exports.querySELECTOFFICE = function(InHospitalName, response){    
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
                                    H.H_KEY,
                                    PATIENT_COUNT,
                                    H_NAME
                                FROM
                                    [OFFICE] O
                                INNER JOIN
                                    [HOSPITAL] H
                                ON
                                    O.H_KEY = H.H_KEY
                                WHERE
                                    (H.H_NAME = '%s')
                                    AND (CONVERT(char(10), LAST_UPDATE_DATE, 126) =
                                        CONVERT(char(10), [DBO].[dReturnDate](getdate()),126))
                                ORDER BY
                                    O_KEY;                      
                                `;
            var query = util.format(queryString, InHospitalName);
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

exports.queryINSERT = function(InReceiptInfo, response){
    var connection = new Connection(Dbcon.config);
    connection.on('connect', function(err){
        if(err){
            response(err);
        }
        else{
            if(InReceiptInfo.S_KEY == TypeConst.StateType.Reservation){
                executeINSERT(connection, InReceiptInfo, response);
            }
            else if(InReceiptInfo.S_KEY == TypeConst.StateType.ReservationCancel || InReceiptInfo.S_KEY == TypeConst.StateType.ReservationFinish){
                executeINSERTReception_Result(connection, InReceiptInfo, response);
            }           
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
        RECEPTION_TIME
    ) 
    VALUES 
    (
        @M_KEY, 
        @H_KEY, 
        @O_KEY, 
        @RECEPTION_TIME
    );
    DECLARE @R_KEY int
    SET @R_KEY = (SELECT @@IDENTITY)   

    INSERT INTO [DBO].[RECEPTION_RESULT]
    (
        R_KEY,
        S_KEY
    ) 
    VALUES 
    (
        @R_KEY, 
        0
    );
    `
    var request = new Request(
        query, 
        function(error) {
            if (error) {
                return callback(error);
            }
            resText = responseFunc.GetReceiptResText(InReceiptInfo);
            callback(null, resText);
        }
    );
    request.addParameter('M_KEY', TYPES.Int, InReceiptInfo.M_KEY);  
    request.addParameter('H_KEY', TYPES.NVarChar, InReceiptInfo.H_KEY);  
    request.addParameter('O_KEY', TYPES.Int, InReceiptInfo.O_KEY);  
    request.addParameter('RECEPTION_TIME', TYPES.DateTime, new Date(InReceiptInfo.RECEPTION_TIME));

    connection.execSql(request);
}

function executeINSERTReception_Result(connection, InReceiptInfo, callback) {
    var query = `
    INSERT INTO [DBO].[RECEPTION_RESULT]
    (
        R_KEY,
        S_KEY
    ) 
    VALUES 
    (
        @R_KEY, 
        @S_KEY
    );`
    var request = new Request(
        query, 
        function(error) {
            if (error) {
                return callback(error);
            }
            if(InReceiptInfo.S_KEY == TypeConst.StateType.ReservationCancel){
                resText = responseFunc.GetReceiptResText(InReceiptInfo);
                callback(null, resText);
            }
            else if(InReceiptInfo.S_KEY == TypeConst.StateType.ReservationFinish){
                callback(null);
            }         
        }
    );
    request.addParameter('R_KEY', TYPES.Int, InReceiptInfo.R_KEY);  
    request.addParameter('S_KEY', TYPES.Int, InReceiptInfo.S_KEY);  
    connection.execSql(request);
}

exports.querySELECTAgentReceiptList = function(Inhosnum, response){    
    var connection = new Connection(Dbcon.config);
    connection.on('connect', function(err){
        if(err){
            response(err);
        }
        else{
            var queryString = `
                            SELECT 
                                R.R_KEY, 
                                (CASE WHEN RR.S_KEY = 0 THEN 'RECEIPT' WHEN RR.S_KEY = 1 THEN 'CANCEL' END) AS S_KEY, 
                                R.RECEPTION_TIME, R.R_KEY, R.H_KEY, M.M_KEY, M.FOREIGNER,
                                O.O_NAME, M.M_NAME, M.PHONE, M.BIRTHDAY, M.GENDER
                            FROM
                                RECEPTION R
                            INNER JOIN 
                                MEMBER M
                            ON
                                R.M_KEY = M.M_KEY
                            INNER JOIN
                                OFFICE O
                            ON
                                R.O_KEY = O.O_KEY
                            INNER JOIN
                                (SELECT 
                                    TMPRR.RR_KEY,
                                    TMPRR.R_KEY,
                                    TMPRR.S_KEY,
                                    TMPRR.REQUEST_TIME
                                FROM
                                    RECEPTION_RESULT AS TMPRR
                                INNER JOIN	
                                    (SELECT 
                                        R_KEY, MAX(REQUEST_TIME) AS REQUEST_TIME
                                    FROM 
                                        RECEPTION_RESULT
                                    GROUP BY
                                        R_KEY) AS G_RR
                                ON
                                    TMPRR.REQUEST_TIME = G_RR.REQUEST_TIME) AS RR
                            ON
                                R.R_KEY = RR.R_KEY
                            WHERE
                                (R.EDIT = 0)
                                AND (R.H_KEY = '%s')
                                AND (S_KEY IN (0, 1))                
                                `;
            var query = util.format(queryString, Inhosnum);
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

exports.queryUPDATENumOfWaitingPatients = function(InOfficeInfo, response){    
    var connection = new Connection(Dbcon.config);
    connection.on('connect', function(err){
        if(err){
            response(err);
        }
        else{
            var querystring = `
                UPDATE 
                    OFFICE
                SET 
                    PATIENT_COUNT = %s, 
                    LAST_UPDATE_DATE = [DBO].[dReturnDate](getdate())
                WHERE 
                    (O_NAME = '%s')
                    AND (H_KEY = '%s');
            `
            var query = "";
            InOfficeInfo.WAITCOUNTS.forEach(element => {
                query = query + util.format(querystring, element.WAITCOUNT, element.OFFICE, InOfficeInfo.HOSNUM);
            });
            
            var request = new Request(
                query, 
                function(error) {
                    if (error) {
                        return response(error);
                    }
                    response(null);
                }
            );
            connection.execSql(request);
        }
    });    
};

exports.queryUPDATERECEPTIONEdit = function(EditType, InR_KEYList, response){    
    var connection = new Connection(Dbcon.config);
    connection.on('connect', function(err){
        if(err){
            response(err);
        }
        else{
            var querystring = `
                        UPDATE
                            RECEPTION
                        SET
                            EDIT = %d
                        WHERE
                            R_KEY IN (%s);
            `
            var query = "";
            query = util.format(querystring, EditType, InR_KEYList);
            
            var request = new Request(
                query, 
                function(error) {
                    if (error) {
                        return response(error);
                    }
                    response(null);
                }
            );
            connection.execSql(request);
        }
    });    
};