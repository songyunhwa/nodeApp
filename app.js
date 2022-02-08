const express=require('express');
const cookieParser=require('cookie-parser');
//const morgan =require('morgan');
const path=require('path');
const session=require('express-session');
//const nunjucks = require('nunjucks');
const dotenv=require('dotenv');
const pageRouter = require('./routes/page');
//const cors = require('@koa/cors'); 
const app = express();
const bodyParser = require("body-parser");
const axios = require('axios');
const passport = require('passport');
const passportConfig = require('./passport');

dotenv.config(); // 현재 디렉토리 위치한 환경변수 읽어냄.


app.set('port', process.env.PORT || 8081);
app.set('view engine', 'html');


app.use(express.static(path.join(__dirname, 'public')));//static파일경로
app.use(bodyParser.json());
//json으로 이루어진 request body 받을 수 있도록
app.use(bodyParser.urlencoded({extended: true}));
//post body 를 추출 . 중첩된 객체표현을 허용 안힘
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
    resave: false,
    saveUnitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly:true,
        secure: false,
    }
}));

// 네이버 로그인 연동 api
passportConfig();
app.use(passport.initialize());
app.use(passport.session());


app.use('/', pageRouter);

/*
app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
    res.status(err.status || 500);
    res.end();
    //res.render('error');
});*/

app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 대기 중');

});

const {sequelize} = require('./models');
sequelize.sync({force: false})
.then(()=> {
    console.log("db connection success");
})
.catch((err)=> {
    console.log(err);
});

/* CORS 허용 
app.proxy = true; // true 일때 proxy 헤더들을 신뢰함
app.use(cors());*/
const options = {
    cors: {
    origin: ['http://localhost:8081'],
    methods: ['GET', 'POST'],
    },
};


// 화면 engine을 ejs로 설정
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

 //socket 설정
const httpServer = require('http').createServer();
const io = require('socket.io')(httpServer, options);
httpServer.listen(4042);

app.set('io', io);

const room = io.of('/room');
const chat = io.of('/chat');


io.use((socket, next) => {
    cookieParser(process.env.COOKIE_SECRET)(socket.request, socket.request.res, next);
    sessionMiddleware(socket.request, socket.request.res, next);
  });

  room.on('connection', (socket) => {
    console.log('room 네임스페이스에 접속');
    room.on('newRoom', ()=> {
      console.log('room 들어감');
    });
    room.on('removeRoom', ()=> {
      console.log('room 나감');
    });
    socket.on('disconnect', () => {
      console.log('room 네임스페이스 접속 해제');
    });
  });

 
  chat.on('connection', (socket) => {

    socket.on('joinRoom', (data) => {
      console.log(data.user + "join Room " + data.roomId);
      //roomId 에 join
       socket.join(data.roomId);
       chat.to(data.roomId).emit('msg', {
          user: 'system',
          data: data.user + `님이 입장하셨습니다.`,
       });
    });
     socket.on('msg', (data) => {
       //room 에 들어오는 채팅
        chat.to(data.roomId).emit('msg', {
          user: data.user,
          userId: data.userId,
          data: data.data
    });
  })
  

    socket.on('leaveRoom', (data) => {
      const roomId = data.roomId;
      const user = data.user;
      
      const userCnt = socket.adapter.rooms.get(roomId).size;
      socket.leave(roomId);
      console.log(socket.adapter.rooms);
   

      const userCount = userCnt ? userCnt-1 : 0;
      console.log(userCount);
      if (userCount === 0) { 

        axios.delete(`http://localhost:8081/room/${roomId}`)
          .then(() => {
            console.log('방 제거 요청 성공');
          })
          .catch((error) => {
            console.error(error);
          });
      } else {
        socket.to(roomId).emit('msg', {
          user: 'system',
          data:  user + '님이 퇴장하셨습니다.',
        });

      }
    })
});

console.log("process.env.client_id : " +process.env.client_id);