const express = require('express');
const app = express();
const multer = require('multer');
var path = require('path');

app.use(express.static(__dirname+'/uploads'));

var cnt_group = []

const {MongoClient,ObjectId} = require('mongodb');
const url = 'mongodb://127.0.0.1:27017/';

const storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null,__dirname+'/uploads');
    },
    filename: (req,file,cb) => {
        var fileext = path.extname(file.originalname);
        const uniqueSuffix = Date.now() + '_' +Math.round(Math.random() * 1E9)
        cb(null,file.fieldname+'_'+uniqueSuffix+fileext)
    }
})

const upload = multer({storage: storage});

//body parser
app.use(express.urlencoded({extended:true}));
app.use(express.json());

//view template
app.set('view engine', 'pug'); //view engine
app.set('views','./views');

//Home page
app.get('/',(req,res) => {
    MongoClient.connect(url,(err,conn) => {
        var db = conn.db('merit');
        db.collection('contact').find().toArray((err,data) =>{
            res.render('contact.pug',{
                allcnt : data
            });
        });
    });
});

app.get('/addcontactform',(req,res) => {
    res.sendFile(__dirname + '/addcontact.html')
})


app.post('/addcontact',upload.single('profilepic'),(req,res) => {
    req.body.profilepic = req.file.filename;
    MongoClient.connect(url,(err,conn) => {
        var db = conn.db('merit');
        db.collection('contact').insertOne(req.body,(err,data) =>{
            if(err){
                console.log(err);
            }else{
                res.send(data);
            }
        });
    });
});

app.get('/deletecontact/:id',(req,res) =>{
    MongoClient.connect(url,(err,conn) => {
        var db = conn.db('merit');
        db.collection('contact').deleteOne({_id : ObjectId(req.params.id)});
        res.redirect('/');
    });
})

//contact update form
app.get('/contactupdate/:id?',(req,res) =>{
    MongoClient.connect(url,(err,conn) => {
        var db = conn.db('merit');
        db.collection('contact').find({_id : ObjectId(req.params.id)}).toArray((err,data) =>{
            res.render('updatecontact.pug',{
                usr : data[0]
            });
        });
    });
})
//Update contact
app.post('/updatecontact/:id?',(req,res) => {
    MongoClient.connect(url,(err,conn) => {
        var db = conn.db('merit');
        db.collection('contact')
        .updateOne(
            {_id : ObjectId(req.params.id)},
            {$set: req.body},
            (err,data) =>{
                if(err){
                    console.log(err);
                }
                else{
                    console.log(data);
                    res.redirect('/');
                }
        });
    });
});

//update profile image

app.get('/profilepic/:id',(req,res) => {
    res.render('profilepic.pug',{
        id : req.params.id
    })
})
app.post('/updateimage/:id?',upload.single('profilepic'),(req,res) => {
    MongoClient.connect(url,(err,conn) => {
        var db = conn.db('merit');
        db.collection('contact')
        .updateOne(
            {_id : ObjectId(req.params.id)},
            {$set: {profilepic : req.file.filename}},
            (err,data) =>{
                if(err){
                    console.log(err);
                }
                else{
                    console.log(data);
                    res.redirect('/');
                }
        });
    });
});

//group middlewaare

function group(req,res,next){
    var group = req.url.replace('/', '');
    MongoClient.connect(url,(err,conn) => {
        var db = conn.db('merit');
        db.collection('contact').find({group:group}).toArray((err,data) =>{
            cnt_group = data
            next()
        });
    });
}

app.get('/friend',group,(req,res) => {
    res.render('contact.pug',{
        allcnt : cnt_group
    })
})

app.get('/work',group,(req,res) => {
    res.render('contact.pug',{
        allcnt : cnt_group
    })
})

app.get('/family',group,(req,res) => {
    res.render('contact.pug',{
        allcnt : cnt_group
    })
})


// app.get();
app.listen(4000,() => {
    console.log('App running on http://localhost:4000/');
});