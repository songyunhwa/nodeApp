const express=require('express');
const router=express.Router();
const mysql  = require('../mysql');
const post = require('../models/post');
const { ChatRoom } = require('../models');
const axios = require('axios');

getRoomList = () =>{
    return new Promise((resolve, reject) =>{
        mysql.getConnection((error, connection)=>{ 
            connection.query('SELECT * FROM chatrooms', function (error, results, fields) {
               if (error) res.body = error;
            
               resolve(results);
             });
           });
    });
};

router.get('/list',  async(req, res, next) =>{
    var data = [];
        const results = await getRoomList();
        results.forEach(result => {
            const room = {
               id: result.id,
               title: result.title,
               postId: result.title,
               userId: result.userId,
               password: result.password,
               max: result.max
            };
            data.push(room);
        });

        res.send(data);
});

router.post('/', async(req, res, next)=>{
    const newRoom = req.body;
    let title = req.body.title == null ? '' : req.body.title;
    let postId = req.body.postId == null ? '' : req.body.postId;
    let userId = req.user.id;
    let password=  req.body.password == null ? '' : req.body.password;
    let max = req.body.max == null ? 2 : req.body.max;

    ChatRoom.findOne({
        where: {postId : postId, userId : userId}
    })
    .then((room) => {
        console.log(room);
        if(room == null){
            mysql.getConnection((error, connection)=>{ 
                connection.query('INSERT INTO chatrooms (title, postId, userId, password, max) VALUES(?,?,?,?,?) '
                 , [title, postId, userId, password , max],
                 function (error, results, fields) {
                    //res.body = results;
                    console.log(newRoom);
                    const io = req.app.get('io');
                   io.of('/room').emit('newRoom', newRoom);
                   return res.json({status: 200, data : results});    
                   //res.render('room');
                }); 
                });
        }else {
            return res.json({status: 200, data : room});   
        }
    })


    
});

/* ????????? ???????????? */
router.get('/:id', async(req, res, next)=>{
try{
    mysql.getConnection((error, connection)=>{ 
        connection.query('SELECT * FROM chatrooms WHERE id = ?', [req.params.id] , function (error, results, fields) {

            const title = results[0].title;
            const postId = results[0].postId; //?????????  id
            const userId = results[0].userId; //????????? ?????? ?????? id

            post.findOne({id : postId}).then((post) => {
                var postWriterId= post.writer;     
                // ????????? ?????? ???????????? ??????.
                console.log("req.user.id" + req.user.id);
                console.log("userId" + userId);
                console.log("postId" + postId);
                if(postWriterId != req.user.id && userId != req.user.id){
                    console.log("????????? ?????? ????????? ????????????.")
                    return res.end();
                }
            })
            // ?????? ????????? ?????? ?????? ??????.
            const io = req.app.get('io');
            const {rooms} = io.of('/chat').adapter;
            if(rooms && rooms[req.params.id] && rooms.max == rooms[req.params.id].length){
                return res.redirect('/?error=?????? ????????? ??????????????????.');
            }
    
             return res.render('chat', {
                 roomId: results[0].id,
                 title: title,
                 chats: [],
                 user: req.user.nick, //????????? ?????????????????? user 
                 userId:  req.user.id
            });
            })
    });
    
}catch(error){
    console.log(error);
}
});

/* ????????? ?????? */
router.delete('/:id', async(req, res, next)=>{
//chatrooms ??????
ChatRoom.destroy({
    id : req.params.id
}).then(() => {
    console.log("chatrooms ??????");
}).catch((error)=> {
    console.error(error);
    console.log(error);
})

//chats ??????
axios.delete(`http://localhost:8081/chat/${req.params.id}`)
          .then(() => {
            console.log('??? ?????? ?????? ??????');
            req.app.get('io').of('/room').emit('removeRoom', req.params.id);
            return res.json({});
          })
          .catch((error) => {
            console.error(error);
          });

});

module.exports = router;