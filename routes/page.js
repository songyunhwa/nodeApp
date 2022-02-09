const express=require('express');
const router=express.Router();
const authRouter = require('./auth');
const roomRouter = require('./chat');
const boardRouter = require('./board');
const postRouter = require('./post');

/* 세션 로그인 정보
var authenticate = function (req, res, next) {
    if (req.authenticate())
      return next();
    res.redirect('/auth/login');
  };

authenticate(); */

router.use('/room', roomRouter);
router.use('/auth', authRouter);
router.use('/', boardRouter);
router.use('/post', postRouter);
module.exports = router;

