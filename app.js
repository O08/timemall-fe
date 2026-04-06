import express from 'express';
import path from 'path';
import cookieParser  from 'cookie-parser';
import logger  from 'morgan';
import cors from 'cors';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

import parseOneLink from './routes/parselink.js';



const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));

app.use(cors())

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'dist'),{extensions: ['html']}));

app.get('/link/parse',async (req,res)=>{
  try {
    let linkInfo = await parseOneLink(req.query.url);
    res.json(linkInfo);
  } catch (error) {
    res.status(500).json({error: 'Failed to parse link' });
  }

});


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

app.get('/viber/hub/:och', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/apps/viber/hub.html")        //设置/ 下访问文件位置
})

app.get('/viber/post/:id', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/apps/viber/story.html")        //设置/ 下访问文件位置
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

app.get('/payroll/statement/:id', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/rainbow/office/salary-stripe.html")        //设置/ 下访问文件位置
})

app.get('/employee/:id/info', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/rainbow/office/employee-info.html")        //设置/ 下访问文件位置
})

app.get('/:hd/invite/:code', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/rainbow/oasis/link-join.html")        //设置/ 下访问文件位置
})

app.get('/rainbow/discovery-partner/:bid', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/rainbow/discovery-partner.html")        //设置/ 下访问文件位置
})

app.get('/:hd/channel/:chn', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/rainbow/oasis/mini.html")        //设置/ 下访问文件位置
})
app.get('/:hd/membership', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/rainbow/oasis/membership.html")        //设置/ 下访问文件位置
})
app.get('/:hd/commission', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/rainbow/oasis/commission.html")        //设置/ 下访问文件位置
})
app.get('/:hd/metrics', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/rainbow/oasis/value-journey.html")        //设置/ 下访问文件位置
})

app.get('/:hd/contributes', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/rainbow/oasis/transparent.html")        //设置/ 下访问文件位置
})

app.get('/:hd/membership-order', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/rainbow/oasis/membership-order.html")        //设置/ 下访问文件位置
})

app.get('/:hd/task/:id', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/rainbow/arch/commission-ws.html")        //设置/ 下访问文件位置
})

app.get('/:hd/apps', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/rainbow/oasis/mini-app-gallery.html")        //设置/ 下访问文件位置
})

app.get('/:hd/back-office/department', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/rainbow/office/department.html")        //设置/ 下访问文件位置
})
app.get('/:hd/back-office/compensation', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/rainbow/office/compensation.html")        //设置/ 下访问文件位置
})
app.get('/:hd/back-office/employee', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/rainbow/office/employee.html")        //设置/ 下访问文件位置
})
app.get('/:hd/back-office/payroll', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/rainbow/office/payroll.html")        //设置/ 下访问文件位置
})

app.get('/:hd/channels', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/rainbow/oasis/mini-assistant.html")        //设置/ 下访问文件位置
})
app.get('/:hd/setting', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/rainbow/oasis/setting.html")        //设置/ 下访问文件位置
})

app.get('/:hd/setting-role', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/rainbow/oasis/setting-role.html")        //设置/ 下访问文件位置
})
app.get('/:hd/setting-member', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/rainbow/oasis/setting-member.html")        //设置/ 下访问文件位置
})
app.get('/:hd/setting-membership', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/rainbow/oasis/setting-membership.html")        //设置/ 下访问文件位置
})
app.get('/:hd/setting-invitation', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/rainbow/oasis/setting-invitation.html")        //设置/ 下访问文件位置
})
app.get('/:hd/setting-invitation-link', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/rainbow/oasis/setting-invitation-link.html")        //设置/ 下访问文件位置
})
app.get('/:hd/setting-fast-link', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/rainbow/oasis/setting-fast-link.html")        //设置/ 下访问文件位置
})
app.get('/:hd/setting-change-admin', (req, res) => {
  res.sendFile(__dirname+"/dist"+"/rainbow/oasis/setting-change-admin.html")        //设置/ 下访问文件位置
})

// match @abc @bcdddd,for brand handle mapping
app.get( /.*@blv\.bi$/, (req, res) => {
  res.sendFile(__dirname+"/dist"+"/mall/bubble.html")        //设置/ 下访问文件位置
})

// match @blv.hub suffix for oasis handle mapping
app.get( /.*@blv\.hub$/, (req, res) => {
  res.sendFile(__dirname+"/dist"+"/rainbow/oasis/home.html")        //设置/ 下访问文件位置
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

export default app;
