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
                                    H.HOSNUM, M.MEMBER_KEY, O.OFFICE_KEY, H.HOSNAME, M.NAME
                                FROM
                                    [HOSPITAL] H, [MEMBER] M, [OFFICE] O
                                WHERE
                                    H.HOSNAME = '%s'
                                    AND M.MEMBER_ID = '%s'
                                    AND O.OFFICE_NAME = '%s'                            
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
                                    TOP 1 W.WORKLIST_KEY, W.HOSNUM, W.MEMBER_KEY, OFFICE_KEY, RECEPTION_TIME,
                                    HOSNAME, MEMBER_NAME, STATE_KEY
                                FROM
                                    WORKLIST W
                                 INNER JOIN
                                    HOSPITAL H
                                ON 
                                    W.HOSNUM = H.HOSNUM
                                INNER JOIN 
                                    MEMBER M
                                ON
                                    W.MEMBER_KEY = M.MEMBER_KEY
                                INNER JOIN
                                    (SELECT 
                                        TMPWR.RESULT_KEY,
                                        TMPWR.WORKLIST_KEY,
                                        TMPWR.STATE_KEY,
                                        TMPWR.REQUEST_TIME
                                    FROM
                                        WORKLIST_RESULT AS TMPWR
                                    INNER JOIN	
                                        (SELECT 
                                            WORKLIST_KEY, MAX(REQUEST_TIME) AS REQUEST_TIME
                                        FROM 
                                            WORKLIST_RESULT
                                        GROUP BY
                                            WORKLIST_KEY) AS G_WR
                                    ON
                                        TMPWR.REQUEST_TIME = G_WR.REQUEST_TIME) AS WR
                                ON
                                    W.WORKLIST_KEY = WR.WORKLIST_KEY
                                WHERE
                                    (M.MEMBER_ID = '%s')
                                    AND (STATE_KEY = 0)
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
                                    OFFICE_KEY,
                                    OFFICE_NAME,
                                    H.HOSNUM,
                                    PATIENT_COUNT,
                                    HOSNAME
                                FROM
                                    [OFFICE] O
                                INNER JOIN
                                    [HOSPITAL] H
                                ON
                                    O.HOSNUM = H.HOSNUM
                                WHERE
                                    (H.HOSNAME = '%s')
                                    AND (CONVERT(char(10), LAST_UPDATE_DATE, 126) =
                                        CONVERT(char(10), [DBO].[dReturnDate](getdate()),126))
                                ORDER BY
                                    OFFICE_KEY;                      
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
            if(InReceiptInfo.STATE_KEY == TypeConst.StateType.Reservation){
                executeINSERT(connection, InReceiptInfo, response);
            }
            else if(InReceiptInfo.STATE_KEY == TypeConst.StateType.ReservationCancel || InReceiptInfo.STATE_KEY == TypeConst.StateType.ReservationFinish){
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
    INSERT INTO [DBO].[WORKLIST]
    (
        MEMBER_KEY, 
        HOSNUM, 
        OFFICE_KEY, 
        RECEPTION_TIME
    ) 
    VALUES 
    (
        @MEMBER_KEY, 
        @HOSNUM, 
        @OFFICE_KEY, 
        @RECEPTION_TIME
    );
    DECLARE @WORKLIST_KEY int
    SET @WORKLIST_KEY = (SELECT @@IDENTITY)   

    INSERT INTO [DBO].[WORKLIST_RESULT]
    (
        WORKLIST_KEY,
        STATE_KEY
    ) 
    VALUES 
    (
        @WORKLIST_KEY, 
        0
    );
    `
    var request = new Request(
        query, 
        function(error) {
            if (error) {
                return callback(error);
            }            
            return callback(null);
        }
    );
    request.addParameter('MEMBER_KEY', TYPES.Int, InReceiptInfo.MEMBER_KEY);  
    request.addParameter('HOSNUM', TYPES.NVarChar, InReceiptInfo.HOSNUM);  
    request.addParameter('OFFICE_KEY', TYPES.Int, InReceiptInfo.OFFICE_KEY);  
    request.addParameter('RECEPTION_TIME', TYPES.DateTime, new Date(InReceiptInfo.RECEPTION_TIME));

    connection.execSql(request);
}

function executeINSERTReception_Result(connection, InReceiptInfo, callback) {
    var query = `
    INSERT INTO [DBO].[WORKLIST_RESULT]
    (
        WORKLIST_KEY,
        STATE_KEY
    ) 
    VALUES 
    (
        @WORKLIST_KEY, 
        @STATE_KEY
    );`
    var request = new Request(
        query, 
        function(error) {
            if (error) {
                return callback(error);
            }
            return callback(null);    
        }
    );
    request.addParameter('WORKLIST_KEY', TYPES.Int, InReceiptInfo.WORKLIST_KEY);  
    request.addParameter('STATE_KEY', TYPES.Int, InReceiptInfo.STATE_KEY);  
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
                                W.WORKLIST_KEY, 
                                (CASE WHEN RR.STATE_KEY = 0 THEN 'RECEIPT' WHEN RR.STATE_KEY = 1 THEN 'CANCEL' END) AS STATE_KEY, 
                                W.RECEPTION_TIME, W.HOSNUM, M.MEMBER_KEY, M.FOREIGNER,
                                O.OFFICE_NAME, M.MEMBER_NAME, M.PHONE, M.BIRTHDAY, M.GENDER
                            FROM
                                WORKLIST W
                            INNER JOIN 
                                MEMBER M
                            ON
                                W.MEMBER_KEY = M.MEMBER_KEY
                            INNER JOIN
                                OFFICE O
                            ON
                                W.OFFICE_KEY = O.OFFICE_KEY
                            INNER JOIN
                                (SELECT 
                                    TMPWR.RESULT_KEY,
                                    TMPWR.WORKLIST_KEY,
                                    TMPWR.STATE_KEY,
                                    TMPWR.REQUEST_TIME
                                FROM
                                    WORKLIST_RESULT AS TMPWR
                                INNER JOIN	
                                    (SELECT 
                                        WORKLIST_KEY, MAX(REQUEST_TIME) AS REQUEST_TIME
                                    FROM 
                                        WORKLIST_RESULT
                                    GROUP BY
                                        WORKLIST_KEY) AS G_WR
                                ON
                                    TMPWR.REQUEST_TIME = G_WR.REQUEST_TIME) AS WR
                            ON
                                W.WORKLIST_KEY = WR.WORKLIST_KEY
                            WHERE
                                (W.EDIT = 0)
                                AND (W.HOSNUM = '%s')
                                AND (STATE_KEY IN (0, 1))                
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
                    (OFFICE_NAME = '%s')
                    AND (HOSNUM = '%s');
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

exports.queryUPDATERECEPTIONEdit = function(EditType, WORKLIST, response){    
    var connection = new Connection(Dbcon.config);
    connection.on('connect', function(err){
        if(err){
            response(err);
        }
        else{
            var querystring = `
                        UPDATE
                            WORKLIST
                        SET
                            EDIT = %d
                        WHERE
                            WORKLIST_KEY IN (%s);
            `
            var query = "";
            query = util.format(querystring, EditType, WORKLIST);
            
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