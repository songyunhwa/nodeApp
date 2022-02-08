const passport = require('passport');
//const naver = require('./naver');
const User = require('../models/user');

const naver = require('./naver');
const local = require('./local');

module.exports = () => {
    passport.serializeUser((user, done) => {
        console.log("serializeUser " + user);
        done(null, user);//세션 저장
    }); 
    
    passport.deserializeUser((user , done) => {
        console.log(JSON.stringify(user));
        done(null, user);
    });

    naver();
    local();
};