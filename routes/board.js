const express=require('express');
const router=express.Router();
const mysql  = require('../mysql');

router.get('/',  async(req, res, next) =>{
    res.render('board');
});

module.exports = router;