var express = require('express');
var router = express.Router();

router.get('/count', function(req, res){
    if(req.session.count){
        req.session.count = req.session.count + 1;
    }
    else{
        req.session.count = 1;
    }
    res.send('count:'+req.session.count);
});

router.get('/temp', function(req, res){
    res.send('result:'+req.session.count);
});

router.get('/auth/login', function(req, res){
    var output = `
    <h1>login</h1>
    <form action ="/session/auth/login" method="post">
        <p>
            <input type="text" name="username" placeholder="username">
        </p>
        <p>
            <input type="password" name="password" placeholder="password">
        </p>
        <p>
            <input type="submit">
        </p>
    </form>
    `;
    res.send(output);
});

router.post('/auth/login', function(req, res){
    var user = {
        username : 'jjj',
        password : '111',
        displayname : 'adam'
    };
    var uname = req.body.username;
    var pwd = req.body.password;
    if(user.username === uname && user.password === pwd){
        req.session.displayname = user.displayname;
        req.session.save(function(){
            res.redirect('/session/welcome');
        });        
    }
    else{
        res.send('who are you');
    }
});

router.get('/welcome', function(req, res){
    if(req.session.displayname){
        res.send(`
            <h1>hello, ${req.session.displayname}</h1>
            <a href="/session/auth/logout">logout</a>
        `);
    }
    else{
        res.send(`
            <h1>welcome</h1>
            <a href="/session/auth/login">login</a>
        `);
    }
});

router.get('/auth/logout', function(req, res){
    delete req.session.displayname;
    req.session.save(function(){
        res.redirect('/session/welcome');
    });
});
module.exports = router;