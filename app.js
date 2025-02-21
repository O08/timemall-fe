var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'dist'),{extensions: ['html']}));


// app.use('/', "'./public/home.html'");
// app.use('/users', usersRouter);

app.get('/',(req,res)=>{
  res.sendFile(__dirname+"/dist"+"/welcome.html")        //设置/ 下访问文件位置
});

app.get('/idea/:och', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/micro/oasis/idea.html")        //设置/ 下访问文件位置
})

app.get('/brand/:id', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/mall/bubble.html")        //设置/ 下访问文件位置
})

app.get('/fb/admin', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/apps/feedsboard/admin.html")        //设置/ 下访问文件位置
})

app.get('/fb/:och', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/apps/feedsboard/fb.html")        //设置/ 下访问文件位置
})

app.get('/fb/:och/:feedId', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/apps/feedsboard/feed.html")        //设置/ 下访问文件位置
})

// match @abc @bcdddd,for brand handle mapping
app.get( /^\/@/, (req, res) => {
  res.sendFile(__dirname+"/dist"+"/mall/bubble.html")        //设置/ 下访问文件位置
})


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404).sendFile(__dirname+"/dist"+"/404.html") 
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
