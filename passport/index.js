const passport = require('passport');
const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const user = require('../models/user');
const { User } = require('../models');

module.exports =  () => {
    passport.serializeUser((user, done) => {
        done(null, user.id);//로그인시
    }); 

    passport.deserializeUser((id , done) => {
        User.findOne({where : {id}}) //매요청시
        .then(user => done(null, user))
        .catch(err => donw(err));
    })
}