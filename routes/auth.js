const express = require('express');
const bcrypt = require('bcrypt');
const { urlencoded } = require('body-parser');
const router = express.Router();
const passport= require('passport');
const mysql  = require('../mysql');
const models = require("../models");
const app = this;

router.get('/naverlogin', 
  passport.authenticate('naver', { authType: 'reprompt' }));

router.get('/callback',
  passport.authenticate('naver', { failureRedirect: '/' }),
  (error, user, req, res) => {
    if(error){
      return res.send(error);
    }
    if(!user){
      return res.send("user 가 없습니다");
    }

    req.login(user, (loginError) => {
      if(loginError){
         return next(loginError);
      } 
        return res.send(); //res.redirect('/');
    });
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

      return res.end(); //res.redirect('/');
    } catch (e) {
      console.log(e);
    }
   })
   .catch(() => {
      res.status = 409; // Conflict
      return;
    })
});

router.post('/login', passport.authenticate('local'), 
(error, user, req, res) => {
  if(error){
    return res.send(error);
  }
  if(!user){
    return res.send("user 가 없습니다");
}
 //serializerUser 호출
  req.login(user, (loginError) => {
    if(loginError){
      console.log("에러있음");
       return next(loginError);
    } 
      return res.send(); //res.redirect('/');
  });
});

router.get('/logout', (req,res) => {
    req.logout();
    req.session.destroy();
    res.end(); //res.redirect('/');
});

module.exports = router;