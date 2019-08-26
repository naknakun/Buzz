let SecretObj = require('../config/jwt');
let jwt = require('jsonwebtoken');

exports.sign = function(req, res){
    jwt.sign(
        {
          id : 'test',
          pw : '1'
        },
        SecretObj.secret,
        {
          expiresIn: '5m'
        },
        function(err, token){
          if(err){
            console.log(err);
            res.send('오류가 발생했습니다.');  
          }                         
          else{
            res.cookie('user', token);
            res.json({
                      token: token
            })
          }
        }
    )  
}

exports.verify = function(req, res){
    let token = req.cookies.user;
    let decoded;
    jwt.verify(token, SecretObj.secret, function(err, decoded){
        if(err){
            console.log(err);
            res.send('토큰에 문제가 있어어어');
        }
        else{
            if(decoded){
                res.send('권한이 있어 실행 가능')
            }
            else{
                res.send('권한이 없습니다.');
            }
        }
    }); 
}