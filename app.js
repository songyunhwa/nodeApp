const express=require('express');
const cookieParser=require('cookie-parser');
const morgan =require('morgan');
const path=require('path');
const session=require('express-session');
//const nunjucks = require('nunjucks');
const dotenv=require('dotenv');
const pageRouter = require('./routes/page');
const cors = require('@koa/cors'); 
const app = express();


dotenv.config(); // 현재 디렉토리 위치한 환경변수 읽어냄.


app.set('port', process.env.PORT || 8081);
app.set('view engine', 'html');


app.use(express.static(path.join(__dirname, 'public')));//static파일경로
app.use(express.json());
//json으로 이루어진 request body 받을 수 있도록
app.use(express.urlencoded({extended: false}));
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

/* CORS 허용 */
app.proxy = true; // true 일때 proxy 헤더들을 신뢰함
app.use(cors());
const options = {
    cors: {
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    },
};

//socket 설정
const httpServer = require('http').createServer();
const io = require('socket.io')(httpServer, options);

io.on("connection", (socket) => {      
  console.log("connection success");

  socket.on('join', (room, user) => {
    onJoin(socket, room, user);
});

socket.on('message', (room, data) => {
    io.sockets.in(room).emit("message", { data: data }); 
});
});


function onJoin(socket, room, user) {
    console.log("Joining room: " + room);
    socket.join(room);
    console.log(user + "( " + socket.id + ")" + " now in " + room);

    io.sockets.in(room).emit("message", { data: user + " came in." }); 

}


httpServer.listen(4042);