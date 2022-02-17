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

/* 채팅룸 들어가기 */
router.get('/:id', async(req, res, next)=>{
try{
    mysql.getConnection((error, connection)=>{ 
        connection.query('SELECT * FROM chatrooms WHERE id = ?', [req.params.id] , function (error, results, fields) {

            const title = results[0].title;
            const postId = results[0].postId; //게시글  id
            const userId = results[0].userId; //채팅방 만든 유저 id

            post.findOne({id : postId}).then((post) => {
                var postWriterId= post.writer;     
                // 채팅방 소유 유저인지 파익.
                console.log("req.user.id" + req.user.id);
                console.log("userId" + userId);
                console.log("postId" + postId);
                if(postWriterId != req.user.id && userId != req.user.id){
                    console.log("채팅방 소유 유저가 아닙니다.")
                    return res.end();
                }
            })
            // 현재 채팅방 허용 인원 파악.
            const io = req.app.get('io');
            const {rooms} = io.of('/chat').adapter;
            if(rooms && rooms[req.params.id] && rooms.max == rooms[req.params.id].length){
                return res.redirect('/?error=허용 인원을 초과했습니다.');
            }
    
             return res.render('chat', {
                 roomId: results[0].id,
                 title: title,
                 chats: [],
                 user: req.user.nick, //세션에 저장되어있는 user 
                 userId:  req.user.id
            });
            })
    });
    
}catch(error){
    console.log(error);
}
});

/* 채팅방 삭제 */
router.delete('/:id', async(req, res, next)=>{
//chatrooms 삭제
ChatRoom.destroy({
    id : req.params.id
}).then(() => {
    console.log("chatrooms 삭제");
}).catch((error)=> {
    console.error(error);
    console.log(error);
})

//chats 삭제
axios.delete(`http://localhost:8081/chat/${req.params.id}`)
          .then(() => {
            console.log('방 제거 요청 성공');
            req.app.get('io').of('/room').emit('removeRoom', req.params.id);
            return res.json({});
          })
          .catch((error) => {
            console.error(error);
          });

});

module.exports = router;