const passport = require('passport');
//const naver = require('./naver');
const { User } = require('../models');

const naver = require('./naver');
const local = require('./local');

    passport.serializeUser((user, done) => {
        done(null, user.id);//로그인시
    }); 

    passport.deserializeUser((id , done) => {
        User.findOne({where : {id}}) //매요청시
        .then(user => done(null, user))
        .catch(err => donw(err));
    });

    naver();
    local();

module.exports=passport;