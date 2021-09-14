const express = require('express');
const app = express();

const {MongoClient,ObjectId} = require('mongodb');
const url = 'mongodb://127.0.0.1:27017/';

// var user = require('./user.routes');

//session 

var session = require('express-session');
app.use(session({secret: "Shh, its a secret!"}));

//body parser
app.use(express.urlencoded({extended:true}));
app.use(express.json());

//cookie parser
var cookieParser = require('cookie-parser');
app.use(cookieParser());

//view template
app.set('view engine', 'pug'); //view engine
app.set('views','./views');

app.get('/',(req,res) => {
    res.sendFile(__dirname + '/home.html')
})
app.get('/aboutus',(req,res) => {
    console.log(req.session.username);
    res.sendFile(__dirname + '/aboutus.html')
})

app.get('/register',(req,res) => {
    if(req.session.username){
        res.send("Logout before Register")
    }else{
        res.sendFile(__dirname + '/userregform.html')
    }
})

app.get('/admin',(req,res) => {
    MongoClient.connect(url,(err,conn) => {
        var db = conn.db('merit');
        db.collection('login').find({auth : 0}).toArray((err,data) =>{
            res.render('authuser.pug',{
                allusers: data
            })
        });
    });
})

app.post('/authuser',(req,res) =>{
    MongoClient.connect(url,(err,conn) => {
        var db = conn.db('merit');
        if(Array.isArray(req.body.id))
        {
            req.body.id.forEach(e => {
                db.collection('login')
                .updateOne(
                    {_id : ObjectId(e)},
                    {$set: {auth : 1}},
                    (err,data) =>{
                        if(err){
                            console.log(err);
                        }
                        else{
                            console.log(data);
                        }
                    });
                });
        }
        else{
            db.collection('login')
            .updateOne(
                {_id : ObjectId(req.body.id)},
                {$set: {auth : 1}},
                (err,data) =>{
                    if(err){
                        console.log(err);
                    }
                    else{
                        console.log(data);
                    }
                })
        }
        
        });
    res.redirect('/');
})


app.get('/login',(req,res) => {
    if(req.session.username){
        res.send("Already Logged In")
    }else{
    res.sendFile(__dirname + '/loginform.html')
    }
})

// --------auth using middleware function-------
function ath(req,res,next){
    if(req.session.username){
        MongoClient.connect(url,(err,conn) => {
            var db = conn.db('merit');
            db.collection('login').find({username : req.session.username}).toArray((err,data) =>{
                if(data[0].psw === req.session.psw){
                    next()
                }
                else{
                    res.redirect('/login')
                }
            });
        });
    }else{
        res.redirect('/login')
    }
}

app.get('/service',ath,(req,res) => {
    res.render('services')
})

app.get('/product',ath,(req,res) => {
    res.render('products')
})

//-----------------------------

app.post('/registeruser',(req,res) => {
    MongoClient.connect(url,(err,conn) => {
        var db = conn.db('merit');
        db.collection('login').find({username: req.body.username}).toArray((err,data) =>{
            if(data.length == 1){
                res.sendFile(__dirname + '/errorregform.html');
            }
            else if(req.body.psw !== req.body.rpsw){
                res.sendFile(__dirname + '/regpassworderror.html');
            }else{
                req.body.auth = 0;
                db.collection('login').insertOne(req.body);
                res.redirect('/')
            }
        });
    });
});

app.post('/loginuser',(req,res) => {
    MongoClient.connect(url,(err,conn) => {
            var db = conn.db('merit');
            db.collection('login').find({username: req.body.username}).toArray((err,data) =>{
            if(data.length === 0){
                res.sendFile(__dirname + '/errorloginform.html');
            }
            else {
                if(data[0].psw === req.body.psw){
                    if(data[0].auth){
                        req.session.username = req.body.username;
                        req.session.psw = req.body.psw;
                        res.redirect('/')
                    }else{
                        res.send('You are not a verified user')
                    }
                    
                }else{
                    res.send('Incorrect Password');
                }
            }
        });
    });
});

//--------auth using middleware (seperate router)----------
// app.use("/user",(req,res,next) => {
//     if(req.cookies.username){
//         MongoClient.connect(url,(err,conn) => {
//             var db = conn.db('merit');
//             db.collection('login').find({username : req.cookies.username}).toArray((err,data) =>{
//                 if(data[0].psw === req.cookies.psw){
//                     next();
//                 }
//                 else{
//                     res.redirect('/login')
//                 }
//             });
//         });
//     }else{
//         res.redirect('/login')
//     }
// });

//logout
app.get('/logout', function(req, res){
    req.session.destroy();
    // res.clearCookie('username');
    // res.clearCookie('psw');
    res.redirect('/login');
 });

// app.use("/user",user);


app.listen(9000,() => {
    console.log("localhost:9000");
})

