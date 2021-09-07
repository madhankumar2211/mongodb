const express = require('express');
const app = express();

const {MongoClient,ObjectId} = require('mongodb');
const url = 'mongodb://127.0.0.1:27017/';

//body parser
app.use(express.urlencoded({extended:true}));
app.use(express.json());

//view template
app.set('view engine', 'pug'); //view engine
app.set('views','./views');

//Home page
app.get('/',(req,res) => {
    res.sendFile(__dirname+'/home.html');
});

//register form page
app.get('/regstud',(req,res) => {
    res.sendFile(__dirname+'/regstud.html');

});

//List data from the DB
app.get('/liststud',(req,res) => {
    MongoClient.connect(url,(err,conn) => {
        var db = conn.db('merit');
        db.collection('student').find().toArray((err,data) =>{
            res.render('stud.pug',{
                allstud : data
            });
        });
    });
});

//Data insert
app.post('/regstudent',(req,res) => {
    MongoClient.connect(url,(err,conn) => {
        var db = conn.db('merit');
        db.collection('student').insertOne(req.body,(err,res) =>{
            if(err){
                console.log(err);
            }
        });
    });
    res.send('Registerd');
});

//search page
// app.get('/searchstud',(req,res) => {
//     res.render('stud_detail.pug',{
//         allstud : ''
//     });
// });


// //search a particular data from the DB
// app.post('/search',(req,res) => {
//     MongoClient.connect(url,(err,conn) => {
//         var db = conn.db('merit');
//         db.collection('student').find(req.body).toArray((err,data) =>{
//             res.render('stud_detail.pug',{
//                 allstud : data
//             });
//         });
//     });
// });

app.get('/studentdetails/:id?',(req,res) => {
    MongoClient.connect(url,(err,conn) => {
        var db = conn.db('merit');
        db.collection('student').find({_id : ObjectId(req.params.id)}).toArray((err,data) =>{
            res.render('stud_detail.pug',{
                allstud : data
            });
        });
    });
})


//delete student
app.get('/deletestudent/:id?',(req,res) => {
    MongoClient.connect(url,(err,conn) => {
        var db = conn.db('merit');
        db.collection('student').deleteOne({_id : ObjectId(req.params.id)});
        res.redirect('/liststud');
    });
});

//student update form
app.get('/studentupdate/:id?',(req,res) =>{
    res.render('studupdate.pug',{
        id : req.params.id
    });
})
//Update Student
app.get('/updatestudent/:id?',(req,res) => {
    console.log(req.params.id);
    console.log(req.query);
    MongoClient.connect(url,(err,conn) => {
        var db = conn.db('merit');
        db.collection('student')
        .updateOne(
            {_id : ObjectId(req.params.id)},
            {$push: {weightEntry : req.query}},
            (err,data) =>{
                if(err){
                    console.log(err);
                }
                else{
                    console.log(data);
                    res.redirect('/liststud');
                }
        });
    });
});


app.listen(8080,() => {
    console.log('App running on http://localhost:8080/');
});