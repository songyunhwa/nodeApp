const express=require('express');
const router=express.Router();
const post  = require('../models/post');
const multer = require('multer')
const upload = multer({dest: 'images/'}) //dest : 저장 위치

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
        postId : '-1',
        title : 'title',
        content: 'content',
        writerYn : true
    });
});

router.get('/:id',  async(req, res, next) =>{
    console.log(req.params.id);
    post.findOne({ where: { id: req.params.id }})
    .then(result => {
        let writerYn = false;
        if(req.user) {
            writerYn= req.user.id == result.writerId ? true : false;
        }

        return   res.render('post', {
            postId : req.params.id,
            title : result.title,
            content: result.content,
            writerYn : writerYn
        });
    })
    .catch(err => {
        console.error(err);
    })
});

getWriterPost = (req, res, next) => {
    post.findOne({ where: { writerId: req.body.id }})
    .then(result => {
        return  res.json({data : result});
    })
    .catch(err => {
        console.error(err);
    })
};

router.post('/', async(req, res, next) =>{
    const { title, content, image } = req.body;
    try{
   
    const user = req.user;
    if(!user) {
        return res.json({ status:400 , data :"로그인을 해야합니다."});
    }
    
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
    if(!req.user) {
        return res.json({ status:400 , data :"로그인을 해야합니다."});
    }

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

router.post('/upload/one',upload.single('img'),(req,res) => {
    res.json(req.file)
    console.log(req.file)
})

router.post('/upload/multipart', upload.array('img'), (req, res, next) => {    
    res.status(201).send(res.json(req.files))
});

router.delete('/:id', async(req, res, next) =>{
        post.destroy(
            {
                where : { id : req.params.id}
            }).then((result)=>{
                return res.json({result});
            })
});

module.exports = router;