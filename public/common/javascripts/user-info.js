const defaultBrandAvatar="https://d13-content.oss-cn-hangzhou.aliyuncs.com/common/image/avator.png";

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


