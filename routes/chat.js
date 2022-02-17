const express=require('express');
const router=express.Router();
const chat = require('../models/chat');
const getWriterPost = require('../routes/post')

router.post('/', async(req, res, next) =>{
    chat.create({
        data: req.body.data,
        roomId:req.body.roomId,
        email: req.body.user,
        userId:req.body.userId,
      })
      .then(()=> {
          return res.end();
      })
      .catch(err => {
        console.error(err);
      }); 
});

router.get('/:id',  async(req, res, next) =>{
    chat.findAll({
        where: { roomId : req.params.id }
    })
    .then((result) => {
        return res.json({data : result});
    })
    .catch((err) => {
        console.error(err);
    })
});

router.get('/',  async(req, res, next) =>{
    // 내가 쓴 posts 의 room 들 //req.user.id
    let result = getWriterPost({id : "test" });
    console.log(result);
    /*
    chat.findAll({
        where: { 
            [Op.or]: [{userId : req.user.id},  {userId : req.params.id}]
        }
    })
    .then((result) => {
        return res.json({data : result});
    })
    .catch((err) => {
        console.error(err);
    })*/
});

router.delete('/:id',  async(req, res, next) =>{
    chat.destroy({
        where: { roomId : req.params.id }
    })
    .then((result) => {
        return res.json({data : result});
    })
    .catch((err) => {
        console.error(err);
    })
});

module.exports = router;