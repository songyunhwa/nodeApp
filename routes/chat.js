const express=require('express');
const router=express.Router();
const mysql  = require('../mysql');

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
               owner: result.owner,
               password: result.password,
               max: result.max
            };
            data.push(room);
        });

        res.send(data);
});

router.post('/', async(req, res, next)=>{
    const newRoom = req.body;
    mysql.getConnection((error, connection)=>{ 
    let owner = req.user.id; 
    let password=  req.body.password == null ? '' : req.body.password;
    let max = req.body.max == null ? 2 : req.body.max;

    connection.query('INSERT INTO chatrooms (title, owner, password, max) VALUES(?,?,?,? ) '
     , [req.body.title, owner, password , max],
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

/* 채팅룸 들어가기 */
router.get('/:id', async(req, res, next)=>{
try{
    mysql.getConnection((error, connection)=>{ 
        connection.query('SELECT * FROM chatrooms WHERE id = ?', [req.params.id] , function (error, results, fields) {

            const title = results[0].title;

            const io = req.app.get('io');
            const {rooms} = io.of('/chat').adapter;
            if(rooms && rooms[req.params.id] && rooms.max <= rooms[req.params.id].length){
             return res.redirect('/?error=허용 인원을 초과했습니다.');
            }

            //세션에 저장되어있는 user nickname 불러오기
            var keys = Object.keys(req.user);
            var values = Object.values(req.user);

            var nick_index =  keys.indexOf("nick");
            var user = values.splice(nick_index, 1);

            console.log("id : "+  values[0]);

             return res.render('chat', {
                 roomId: results[0].id,
                 title: title,
                 chats: [],
                 user: user,
                 userId:  values[0]
            });
            })
    });
    
}catch(error){
    console.log(error);
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
router.delete('/:id', async(req, res, next)=>{
deleteRoom(req).then(() => {
    console.log("들어옴");
    req.app.get('io').of('/room').emit('removeRoom', req.params.id);

}).catch((error)=> {
    console.error(error);
    console.log(error);
})
});

module.exports = router;