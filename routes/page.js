const express=require('express');
const router=express.Router();


const mysql  = require('../mysql');

router.get('/list',  async(req, res, next) =>{
    var data = [];
        const results = await getRoomList();
        results.forEach(result => {
            const room = {
               id: result.id,
               title: result.title,
               owner: result.owner,
               password: result.password,
               max: result.max
            };
            data.push(room);
        });

        res.send(data);
});
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

router.post('/room', async(req, res, next)=>{

        const newRoom = req.body;
        mysql.getConnection((error, connection)=>{ 
            
        connection.query('INSERT INTO chatrooms (title, owner, password, max) VALUES(?,?,?,? ) '
         , [req.body.title, req.body.owner, req.body.password, req.body.max],
         function (error, results, fields) {
            console.log(results);
            console.log(error);
            //res.body = results;
            console.log(newRoom);
            const io = req.app.get('io');
           io.of('/room').emit('newRoom', newRoom);
           res.render('room');
        }); 
        });
        
});

updateChatroomUser= (userCnt) => {
  
    return new Promise((resolve, reject) =>{
        mysql.getConnection((error, connection)=>{ 
            connection.query('UPDATE chatrooms SET current= ?' ,[userCnt], function (error, results, fields) {
               if (error) reject(error);
        
               resolve(results);
             });
           });
    });
};

/* 채팅룸 들어가기 */
router.get('/room/:id', async(req, res, next)=>{
    try{
        mysql.getConnection((error, connection)=>{ 
            connection.query('SELECT * FROM chatrooms WHERE id = ?', [req.params.id] , function (error, results, fields) {
 
                const title = results[0].title;

                const io = req.app.get('io');
                const {rooms} = io.of('/chat').adapter;
                if(rooms && rooms[req.params.id] && rooms.max <= rooms[req.params.id].length){
                 return res.redirect('/?error=허용 인원을 초과했습니다.');
                }

                updateChatroomUser(results[0].current+1).catch((error) => {
                    console.log(error);
                    console.error(error);
                })

                 return res.render('chat', {
                     roomId: results[0].id,
                     title: title,
                     chats: [],
                    user: req.session.color});
                })
        });
        
    }catch(error){
        console.log(error);
    }
});

/* 채팅방 나가기 */
router.post('/room/:id', async(req, res, next)=>{ 
    try{
        mysql.getConnection((error, connection)=>{ 
            connection.query('SELECT * FROM chatrooms WHERE id = ?', [req.params.id] , function (error, results, fields) {
             
                updateChatroomUser(results[0].current+1).catch((error) => {
                    console.log(error);
                    console.error(error);
                })
            })
        });

    }catch(error){
        console.log(error);
        console.error(error);
    }
});

deleteRoom = (req) =>{
    return new Promise((resolve, reject) =>{
        mysql.getConnection((error, connection)=>{ 
            connection.query('DELETE FROM chatrooms WHERE id = ?', [req.params.id] , function (error, results, fields) {
                if (error) reject(error);
                resolve();

            })
        });
    });
};

/* 채팅방 삭제 */
router.delete('/room/:id', async(req, res, next)=>{
    deleteRoom(req).then(() => {
        console.log("들어옴");
        req.app.get('io').of('/room').emit('removeRoom', req.params.id);
 
    }).catch((error)=> {
        console.error(error);
        console.log(error);
    })
});

module.exports = router;

