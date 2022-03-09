const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const passport= require('passport');
const models = require("../models");

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
    try{
    // username  이 이미 존재하는지 확인
   const hash = await bcrypt.hash(password, 12);
   const [users, created] = await models.User.findOrCreate({
    where: {  email : email },
    defaults: {
     email : email,
     nick : nick,
     password : hash
    }
   })
  }catch{
        res.status = 409; // Conflict
        return;
  }
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