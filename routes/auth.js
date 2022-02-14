const express = require('express');
const bcrypt = require('bcrypt');
const { urlencoded } = require('body-parser');
const router = express.Router();
const passport= require('passport');
const mysql  = require('../mysql');
const models = require("../models");
const app = this;

router.get('/login', (req, res, next) => {
  res.render('login');
});

router.get('/join', (req, res, next) => {
  res.render('login');
});

router.get('/naverlogin', 
  passport.authenticate('naver', { authType: 'reprompt' }));

router.get('/callback',
  passport.authenticate('naver', { failureRedirect: '/' }),
  (req, res) => {
    return res.redirect('/');
  },
);

router.get('/loginCheck', (req, res, next) => {
  if(req){
    if(req.user)
      return res.json({user : req.user});
    else 
      return res.json({});
    }
  });

router.post('/join', async (req, res) => {
  const { email, nick, password } = req.body;

    // username  이 이미 존재하는지 확인
   models.User.findOne({ where: { email: email }})
   .then( async( user )=> {
    try {
      if(user){
        return  res.send(409);
      }

      const hash = await bcrypt.hash(password, 12);
     
      models.User.create({
        email : email,
        nick : nick,
        password : hash,
      })
      .then((result) => {
        return res.json({result}); 
      })
    } catch (e) {
      console.log(e);
    }
   })
   .catch(() => {
      res.status = 409; // Conflict
      return;
    })
});

router.post('/login',(req,res, next)=> {
  passport.authenticate('local', (error, user, info) => {

    if(error){
      return res.json({status: 404, data: error});  
    }
    //serializerUser 호출
    req.login(user, (loginError) => {
      if(loginError){
        return next(loginError);
      } 
      const result = { ...user.dataValues };
      delete result.password;
      return res.json(result);
    });
  })(req, res, next);
});

router.get('/logout', (req,res) => {
    req.logout();
    req.session.destroy();
    return res.json({status: 200});    
});

module.exports = router;