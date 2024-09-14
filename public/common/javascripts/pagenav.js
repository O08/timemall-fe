/**
 * 
 * 0.1-- page nav
 */
 export  function go(url){
    window.location.href=url;
} 
  
   /**
    * 0.2-- go login page
    */
export  function goLoginPage(){
      go("/login")
   }
   /**
 * 
 * 0.3 go home page
 */ 
export  function goHome(){
    go("/home")
}
export  function goWelcome(){
    go("/welcome")
}

export function goStudioStore(){
    go("/estudio/studio-store")
}
export function refresh(){
    window.location.reload();
}
export function goBackAndReload(){
    window.location.href = document.referrer;
}
export function nextPageWhenLoginSuccess(){
    const isAuthPage = document.referrer.search("login") > 0 || document.referrer.search("signup")>0 || document.referrer.search("login.html") > 0 || document.referrer.search("signup.html")>0;
    if(isAuthPage){
        goHome();
    }else{
        goBackAndReload();
    }
}
export function nextPageWhenWxLoginSuccess(){
    const isAuthPage = document.referrer.search("login") > 0 || document.referrer.search("signup")>0 || document.referrer.search("login.html") > 0 || document.referrer.search("signup.html")>0;
    if(isAuthPage){
        goHome();
    }else{
        goBackAndReload();
    }
}