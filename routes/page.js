const express=require('express');

const router=express.Router();

router.use((req,res,next)=> {
    res.locals.user=req.user;
    res.locals.followerCount = 0;
    res.locals.follwingCount = 0;
    res.locals.followerIdList =[];
    next();
})

router.get('/profile', (req, res) => {
    res.render('profile', {title:'내정보'});
});

router.get('/join', (req, res) => {
    res.render('join', {title: '회원가입'});
});

router.get('/', (req, res, next) => {
    const twits = [];
    res.render('main', {
        title : 'NodeBird',
        twits,
    });//서버가 클라이언트에게 렌더링하여 보내겠다는 의미
});

module.exports = router;