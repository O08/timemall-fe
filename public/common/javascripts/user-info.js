const defaultBrandAvatar="https://d13-content.oss-cn-hangzhou.aliyuncs.com/common/image/panda-kawaii.svg";

async function fetchUserInfo(){
    const url="/api/v1/web_mall/me";
    return await fetch(url);
  }
  async function userHandler(){
    const needAuth=!!document.querySelector(".need_auth");
    var btnLogninEl=document.querySelector(".button_login");
    var btnUserEl=document.querySelector(".button_user");
    var btnRegitsterEl=document.querySelector(".button_register");
 
    const response= await fetchUserInfo();
    var data = await response.json();
    if(data.code==200){

        if(!!btnUserEl){
          btnUserEl.style.display="inline-block";
          document.querySelector(".button_user img").src=!data.user.avatar ? defaultBrandAvatar : data.user.avatar;
          btnUserEl.classList.add("brand-avatar");
        }
        return;    
    }
    if(data.code==2001 && needAuth){
       window.location.href="/login";
       return;
    }

    if(!!btnLogninEl){
      btnLogninEl.style.display="inline-block";
    }
    if(!!btnRegitsterEl){
      btnRegitsterEl.style.display="inline-block";
    }

  }

  userHandler();


  //除navigator.onLine属性之外，为了更好地确定网络是否可用，HTML5还定义了两个事件：online和offline。
//当网络从离线变为在线或者从在线变为离线时，分别触发这两个事件。这两个事件在window对象上触发。
var EventUtil = {
  addHandler: function(element, type, handler) {
      if (element.addEventListener) {
          element.addEventListener(type, handler, false);
      } else if (element.attachEvent) {
          element.attachEvent("on" + type, handler);
      } else {
          element["on" + type] = handler;
      }
  }
};

EventUtil.addHandler(window, "offline", function() {
  window.location.href="/pwa-bad-network";
});
