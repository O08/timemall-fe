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
      go("/login.html")
   }
   /**
 * 
 * 0.3 go home page
 */ 
export  function goHome(){
    go("/home.html")
}

export function goStudioStore(){
    go("/estudio/studio-store.html")
}
export function refresh(){
    window.location.reload();
}
export function goBackAndReload(){
    window.location.href = document.referrer;
}
export function nextPageWhenLoginSuccess(){
    const isAuthPage = document.referrer.search("login.html") > 0 || document.referrer.search("signup.html")>0;
    if(isAuthPage){
        goHome();
    }else{
        goBackAndReload();
    }
}