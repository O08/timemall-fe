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




app.get('/',(req,res)=>{
  res.sendFile(__dirname+"/dist"+"/welcome.html")        //设置/ 下访问文件位置
});

app.get('/idea/:och', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/rainbow/oasis/idea.html")        //设置/ 下访问文件位置
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

app.get('/apps/gallery/:och', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/apps/gallery/gem.html")        //设置/ 下访问文件位置
})

app.get('/apps/gallery/admin', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/apps/gallery/admin.html")        //设置/ 下访问文件位置
})

app.get('/apps/link-shopping/:och', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/apps/link-shopping/mall.html")        //设置/ 下访问文件位置
})

app.get('/apps/link-shopping/admin', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/apps/link-shopping/admin.html")        //设置/ 下访问文件位置
})

app.get('/apps/group-chat/:och', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/apps/group-chat/chat.html")        //设置/ 下访问文件位置
})

app.get('/apps/desk/:och', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/apps/desk/your-apps.html")        //设置/ 下访问文件位置
})

app.get('/apps/group-chat/admin', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/apps/group-chat/admin.html")        //设置/ 下访问文件位置
})

app.get('/mall/dsp-case/:case_no', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/mall/dsp-case.html")        //设置/ 下访问文件位置
})

app.get('/messages', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/rainbow/arch/messages.html")        //设置/ 下访问文件位置
})

app.get('/messages/:friend', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/rainbow/arch/messages.html")        //设置/ 下访问文件位置
})

app.get('/rainbow/oasis', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/rainbow/oasis/home.html")        //设置/ 下访问文件位置
})

app.get('/mall/virtual/:item', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/mall/virtual-item.html")        //设置/ 下访问文件位置
})

app.get('/proposal/compose', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/estudio/studio-proposals-compose.html")        //设置/ 下访问文件位置
})
app.get('/proposal/:projectNo/compose', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/estudio/studio-proposals-compose.html")        //设置/ 下访问文件位置
})
app.get('/proposal/:projectNo', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/estudio/studio-proposals-review.html")        //设置/ 下访问文件位置
})


app.get('/:seller/:product/subscription', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/estudio/studio-user-subscribe.html")        //设置/ 下访问文件位置
})

app.get('/:seller/:product/:planId/subscription', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/estudio/studio-user-subscribe.html")        //设置/ 下访问文件位置
})

app.get('/business/paper/:id', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/mall/business-paper.html")        //设置/ 下访问文件位置
})

app.get('/apps/redeem/gallery/:och', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/apps/redeem/gallery.html")        //设置/ 下访问文件位置
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
