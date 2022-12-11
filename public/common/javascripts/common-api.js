
var Api = {}

function getUserInfo(){

   var res={}
   $.ajaxSetup({async: false});
   $.get('/api/v1/web_mall/me',function(data) {
     res = data;
    })
      .fail(function(data) {
        // place error code here
        alert('芜湖,系统裂开了！请稍后重试！')
      });
   return res;
 }
Api.getUserInfo = getUserInfo;

// logout
function logout(){

   var res={}
   $.ajaxSetup({async: false});
   $.get('/api/v1/web_mall/logout',function(data) {
     res = data;
    })
      .fail(function(data) {
        // place error code here
        alert('芜湖,系统裂开了！请稍后重试！')
      });
   return res;
 }
Api.logout = logout;

export {Api}