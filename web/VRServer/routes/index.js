var express = require('express');
var router = express.Router();
let jwt = require('jsonwebtoken');
let SecretObj = require('../config/jwt');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', function(req, res){
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
});

router.get('/someapi', function(req, res){
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
});

module.exports = router;
