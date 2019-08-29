let DbInfo = require('./dbconfig');

exports.config =
{
    authentication: {
        options: {
            userName: DbInfo.userName, 
            password: DbInfo.password 
        },
        type: 'default'
    },
    server: DbInfo.server, 
    options:
    {
        database: DbInfo.database, 
        encrypt: true
    }
}
