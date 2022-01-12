const express=require('express');
const cookieParser=require('cookie-parser');
const morgan =require('morgan');
const path=require('path');
const session=require('express-session');
//const nunjucks = require('nunjucks');
const dotenv=require('dotenv');
const passwort =require('passport'); // 로그인 검증된 모듈
const passsportConfig = require('./passport');
passsportConfig();

const app = express();
app.set('port', process.env.PORT || 8081);
app.set('view engine', 'html');
/*
nunjucks.configure('views', {
    express: app,
    watch: true
})*/

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
app.use(passport.initialize());
app.use(passport.session());

const pageRouter = require('./routes/page');
app.use('/', pageRouter);

app.use((req, res, next) => {
    const error = new Error('${req.method} ${req.url} 라우터가 없습니다.');
    error.status =404;
    next(error);
});

dotenv.config(); // 현재 디렉토리 위치한 환경변수 읽어냄.

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