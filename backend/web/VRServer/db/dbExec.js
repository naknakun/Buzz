var Connection = require('tedious').Connection;
var Request = require('tedious').Request;

var Dbcon = require('./dbCon');

exports.query = function(req, res){
    var connection = new Connection(Dbcon.config);
    connection.on('connect', function(err){
        if(err){
            console.log(err);
        }
        else{
            executeTest(connection, function(error, results) {
                if(error){
                    console.log(error);
                }
                else{
                    var json = JSON.stringify(results);
                    res.send(json);
                }
            });
        }
    });    
};

function executeTest(connection, callback) {
    var results = [];

    var request = new Request(
        "SELECT * FROM [DBO].[VR_USER]", 
        function(error) {
            if (error) {
                return callback(error);
            }
            // pass the results array on through the callback
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