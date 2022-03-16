const express=require('express');
const router=express.Router();
const post  = require('../models/post');
const multer = require('multer')
const axios = require('axios');
const path = require('path');
let storage = multer.diskStorage({ destination: function(req, file ,callback){ callback(null,  __dirname + '/images/') }, filename: function(req, file, callback){ let extension = path.extname(file.originalname); let basename = path.basename(file.originalname, extension); callback(null, basename + "-" + Date.now() + extension); } });
var upload = multer({ storage : storage});

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
        writerYn : true,
        image: null
    });
});

router.get('/detail/:id',  async(req, res, next) =>{
    console.log(req.params.id);
    post.findOne({ where: { id: req.params.id }})
    .then(result => {
        let writerYn = false;
        if(req.user) {
            writerYn= req.user.id == result.writerId ? true : false;
        }

        return   res.render('postDetail', {
            postId : req.params.id,
            title : result.title,
            content: result.content,
            writerYn : writerYn,
            image : result.image
        });
    })
    .catch(err => {
        console.error(err);
    })
});


router.get('/:id',  async(req, res, next) =>{
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
            image: result.image,
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
    const { title, content, image }= req.body;
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
        return res.json({});
     })
     .catch(err => {
        console.error(err);
     });
});


router.post('/:id', async(req, res, next) =>{
    const { title, content, image } = req.body;

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

router.post('/upload',upload.single('data'),(req,res) => {
    const user = req.user;
    let writerId = user.id;
    let writer = user.nick;

    post.create({
        title : req.body.title,
        content : req.body.content,
        image : req.file.filename,
        writerId : writerId,
        writer: writer
      })
      .then(result => {
        return res.json({});
     })
     .catch(err => {
        console.error(err);
     });
    
})

router.post('/update/:id',upload.single('data'),(req,res) => {
    console.log("update one");
    post.update({
        title : req.body.title,
        content : req.body.content,
        image : req.file.filename
    }, 
    {
        where: {id:  req.params.id }
    })
      .then(result => {
        return res.json({});
     })
     .catch(err => {
        console.error(err);
     });
    
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