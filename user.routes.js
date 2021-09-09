var express = require("express");
var router = express.Router();

router.get('/service',(req,res) => {
    res.render('services')
})

router.get('/product',(req,res) => {
    res.render('products')
})


module.exports = router;