const express=require('express');
const router=express.Router();


const mysql  = require('../mysql');
router.get('/list',  async(req, res, next) =>{
  
            var data = [];
            mysql.getConnection( (error, connection)=>{ 
              
               
             connection.query('SELECT * FROM chatrooms', function (error, results, fields) {
                if (error) res.body = error;
                
                results.forEach(result => {
                    data.push(result);
                });
              });
            });

        //res.render("__dirname + "/public/room.html);

});

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

router.get('/room/:id', async(req, res, next)=>{
    try{
        mysql.getConnection((error, connection)=>{ 
            connection.query('SELECT * FROM chatrooms WHERE id = ?', [req.params.id] , function (error, results, fields) {
                console.log(results[0].title);
                const title = results[0].title;

                const io = req.app.get('io');
                const {rooms} = io.of('/chat').adapter;
                if(rooms && rooms[req.params.id] && rooms.max <= rooms[req.params.id].length){
                 return res.redirect('/?error=허용 인원을 초과했습니다.');
                }

        
                 return res.render('chat', {rooms,
                     title: title,
                     chats: [],
                    user: req.session.color});
                })
        });
        
    }catch(error){
        console.log(error);
    }
});

router.delete('/room/:id', async(req, res, next)=>{
    try{
        mysql.getConnection((error, connection)=>{ 

            connection.query('DELETE * FROM chatrooms WHERE id = ?', [req.body.id] , function (error, results, fields) {
                if (error) res.body = error;
                console.log(results);
            })
        });
        res.send('ok');
        setTimeout(()=> {
            req.app.get('io').of('/room').emit('removeRoom', req.params.id);
        }, 2000);
    }catch(error){
        console.log(error);
    }
});
module.exports = router;