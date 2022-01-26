const express=require('express');
const cookieParser=require('cookie-parser');
const morgan =require('morgan');
const path=require('path');
const session=require('express-session');
//const nunjucks = require('nunjucks');
const dotenv=require('dotenv');
const pageRouter = require('./routes/page');
//const cors = require('@koa/cors'); 
const app = express();
const bodyParser = require("body-parser");


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
//app.use(passport.initialize());
//app.use(passport.session());


app.use('/', pageRouter);

app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

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
    origin: ['http://localhost:3000'],
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

    socket.on('disconnect', () => {
      console.log('room 네임스페이스 접속 해제');
    });
  });

  chat.on('connection', (socket) => {

    const req = socket.request;
    console.log("connection " + req);
    const roomId = req.body;
  
    //roomId 에 join
    socket.join(roomId);
    socket.to(roomId).emit('join', {
      user: 'system',
      chat: `${req.session.color}님이 입장하셨습니다.`,
    });
    console.log("방에 들어옴.");

    socket.on('disconnect', () => {
      socket.leave(roomId);
      // 사용자 
      const users = socket.adapter.rooms[roomId];
      const userCount = users ? users.users : 0;
      if (userCount === 0) { 

        axios.delete(`http://localhost:8081/room/${roomId}`)
          .then(() => {
            console.log('방 제거 요청 성공');
          })
          .catch((error) => {
            console.error(error);
          });
      } else {
        socket.to(roomId).emit('exit', {
          user: 'system',
          chat: `${req.session.color}님이 퇴장하셨습니다.`,
        });

        onsole.log("방에 나감.");
      }
    })
});