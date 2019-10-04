var express = require('express');
var router = express.Router();

router.get('/count', function(req, res){
    if (req.signedCookies.count){
        var count = parseInt(req.signedCookies.count);
        count = count + 1;
    }
    else {
        var count = 0;
    }
    res.cookie('count', count, {signed:true});
    res.send('count : '+ count);
});
var products = {
    1:{title:'The History of web'},
    2:{title:'The Next of web'}
};

router.get('/product', function(req, res){
    var output = '';
    for(var name in products){
        output += `
            <li>
                <a href="/cookie/cart/${name}">${products[name].title}
            </li>`;
    }
    res.send(`<h1>product</h1> <ul>${output}</ul> <a href="/cookie/cart">Cart</a>`);
});

router.get('/cart/:id', function(req, res){
    var id = req.params.id;
    if(req.signedCookies.cart){
        var cart = req.signedCookies.cart;
    }
    else{
        var cart = {};
    }
    if(!cart[id]){
        cart[id] = 0;
    }
    cart[id] = parseInt(cart[id]) + 1;
    res.cookie('cart', cart, {signed:true});
    res.redirect('/cookie/cart');
});

router.get('/cart', function(req, res){
    var cart = req.signedCookies.cart;
    if(!cart){
        res.rend('Empty');
    }
    else{
        var output = '';
        for(var id in cart){
            output += `<li>${products[id].title} (${cart[id]})</li>`
        }
    }
    res.send(`<ul>${output}</ul><a href="/cookie/product">product list</a>`);
});

module.exports = router;