const passport = require('passport');
const NaverStrategy = require('passport-naver').Strategy;
const User = require('../models/user');


module.exports = () => {

    passport.use(
       new NaverStrategy(
          {
             clientID: process.env.client_id,
             clientSecret: process.env.client_secret,
             callbackURL: '/auth/callback',
          },
          async (accessToken, refreshToken, profile, done) => {
             //console.log('naver profile : ', profile._json);
             try {
                const exUser = await User.findOne({
                   // 네이버 플랫폼에서 로그인 했고 & snsId필드에 네이버 아이디가 일치할경우
                   where: { snsId: profile.id, provider: 'naver' },
                });
                // 이미 가입된 네이버 프로필이면 성공
                if (exUser) {
                   done(null, exUser);
                } else {
                   // 가입되지 않는 유저면 회원가입 시키고 로그인을 시킨다
          
                   const newUser = await User.create({
                      email: profile._json.email,
                      nick: profile._json.nickname == null? 
                      profile._json.email.substring(0, profile._json.email.indexOf('@')) : profile._json.nickname ,
                      snsId: profile._json.id,
                      provider: 'naver',
                   });
                   done(null, newUser);
                }
             } catch (error) {
                console.error(error);
                done(error);
             }
          },
       ),
    );
  };
  