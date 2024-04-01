async function fetchUserInfo(){
    const url="/api/v1/web_mall/me";
    return await fetch(url);
  }
  async function userHandler(){
    const needAuth=!!document.querySelector(".need_auth");
    const response= await fetchUserInfo();
    var data = await response.json();
    if(data.code==200){
        var btnLogninEl=document.querySelector(".button_login");
        if(!!btnLogninEl){
          btnLogninEl.style.display="none";
        }

        var btnUserEl=document.querySelector(".button_user");
        if(!!btnUserEl){
          btnUserEl.style.display="block";
        }

        var btnRegitsterEl=document.querySelector(".button_register");
        if(!!btnRegitsterEl){
          btnRegitsterEl.style.display="none";
        }
        
    }
    if(data.code==2001 && needAuth){
       window.location.href="/login.html";
    }

  }

  userHandler();