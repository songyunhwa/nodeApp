const express=require('express');
const router=express.Router();
const post  = require('../models/post');


router.get('/list',  async(req, res, next) =>{
    post.findAll({})
    .then(result => {
        res.json(result);
     })
     .catch(err => {
        console.error(err);
     });
});

router.get('/',  async(req, res, next) =>{
    res.render('post', {
        postId : '-1'
    });
});

router.get('/:id',  async(req, res, next) =>{
    res.render('post', {
        postId : req.params.id
    });
});

router.post('/', async(req, res, next) =>{
    const { title, content, image } = req.body;
    try{
   
    const user = req.user;
    console.log(user);
    
    let writerId = user.id;
    let writer = user.nick;

    post.create({
        title : title,
        content : content,
        image : image,
        writerId : writerId,
        writer: writer
      })
      .then(result => {
        res.json({});
     })
     .catch(err => {
        console.error(err);
     });

    }catch(e){
        console.log(e);
    }
});


router.post('/:id', async(req, res, next) =>{
    const { title, content, image } = req.body;

    console.log("post 들어옴 " + req.params.id);

    post.update({
        title : title,
        content : content,
        image : image == null ? null : image,
    }, 
    {
        where: {id:  req.params.id }
    })
      .then(result => {
        res.json(result);
     })
     .catch(err => {
        console.error(err);
     });


});

router.delete('/:id', async(req, res, next) =>{
        post.destroy(
            {
                where : { id : req.params.id}
            }).then(()=>{
                res.redirect('/');
            })
});

module.exports = router;