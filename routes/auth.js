const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const { urlencoded } = require('body-parser');
const router = express.Router();

router.get('/naverlogin', 
  passport.authenticate('naver', { authType: 'reprompt' }));

router.get('/callback',
  passport.authenticate('naver', { failureRedirect: '/' }),
  (req, res) => {
     res.redirect('/');
  },
);

/*
  POST /api/auth/register
  {
    username: 'velopert',
    password: 'mypass123'
  }
*/

router.post('/join', async ctx => {
  const { email, nick, password } = ctx.request.body;
  passport.authenticate('naver', { authType: 'reprompt' });
});

  /*
  try {
    // username  이 이미 존재하는지 확인
    const exists = await User.findByUsername(username);
    if (exists) {
      ctx.status = 409; // Conflict
      return;
    }
    const hash = await bcrypt.hash(password, 12);
    const user = new User({
      email,
      nick,
      password : hash,
    });
    await user.save(); // 데이터베이스에 저장

    return res.redirect('/');
  } catch (e) {
    console.log(e);
    return next(e);

  }
});

*/
router.post('/login',  async ctx => {
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