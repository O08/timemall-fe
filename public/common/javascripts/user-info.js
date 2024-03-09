async function fetchUserInfo(){
    const url="/api/v1/web_mall/me";
    return await fetch(url);
  }
  async function userHandler(){
    const needAuth=!!document.querySelector(".need_auth");
    const response= await fetchUserInfo();
    var data = await response.json();
    if(data.code==200){
        document.querySelector(".button_login").style.display="none";
        document.querySelector(".button_user").style.display="block";
    }
    if(data.code==2001 && needAuth){
       window.location.href="/login.html";
    }

  }

  userHandler();