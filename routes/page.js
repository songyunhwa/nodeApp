const express=require('express');
const router=express.Router();
const authRouter = require('./auth');
const roomRouter = require('./chat');

router.use('/room', roomRouter);
router.use('/auth', authRouter);

module.exports = router;

