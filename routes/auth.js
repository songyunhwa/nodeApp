const express = require('express');
const bcrypt = require('bcrypt');
const { urlencoded } = require('body-parser');
const router = express.Router();
const passport= require('../passport/index');
const mysql  = require('../mysql');
const models = require("../models");

router.get('/naverlogin', 
  passport.authenticate('naver', { scope: ['profile'] }));

router.get('/callback',
  passport.authenticate('naver', { failureRedirect: '/' }),
  (req, res) => {
     res.redirect('/');
  },
);


router.post('/join', async (req, res) => {
  const { email, nick, password } = req.body;
    // username  이 이미 존재하는지 확인
   models.User.findOne({ where: { email: email }})
   .then( async( user )=> {
    try {
      if(user){
        res.send(409);
        return;
      }
      const hash = await bcrypt.hash(password, 12);
      models.User.create({
        email : email,
        nick : nick,
        password : hash,
      });

      return res.redirect('/');
    } catch (e) {
      console.log(e);
    }
   })
   .catch(() => {
      res.status = 409; // Conflict
      return;
    })
});


router.post('/login',  (req, res) => {
  passport.authenticate('local', (authError, user, info)=> {
  if(authError){
      console.error(authError);
  }
  if(!user){
      return "user 가 없습니다"
  }
  return req.login(user, (loginError) => { //serializerUser 호출
      if(loginError){
          console.log(loginError);
          return next(loginError);
      }
        return res.redirect('/');
    });
});
});


router.get('/logout', (req,res) => {
    req.logout();
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;