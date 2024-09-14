import { getQueryVariable } from "/common/javascripts/util.js";
import {goHome} from "/common/javascripts/pagenav.js";



async function doLoadAuthenticationInfo(code,state){
    const url="/api/v1/web_mall/do_wechat_qrCode_sign_in?code="+code + "&state=" + state;
    return await fetch(url);
  }
  async function loadAuthenticationInfo(){

    const code = getQueryVariable("code");
    const state = getQueryVariable("state");
    if(!code || !state){
        alert("警告：请停止非法操作");
    }
    const toPage=getQueryVariable("to_page");
    const response =  await doLoadAuthenticationInfo(code,state);
    var data = await response.json();

    if(data.code == 200){
        // to login success handler
        // 清除所有缓存数据
        localStorage.clear();
        var isEmptyPage= !toPage;

        var isAuthPage = !!toPage ? (toPage.search("login") > 0 || toPage.search("signup")>0 || toPage.search("login.html") > 0 || toPage.search("signup.html")>0) : false;


        
        var isThirdSite= (!!toPage && !isAuthPage) ? (new URL(toPage).hostname.search("bluvarri.com") == -1) : false;

        if(isEmptyPage || isAuthPage  || isThirdSite){
            goHome();
        }else{
            window.location.href=toPage;
        }
    }
    if(data.code !=200){
        alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+data.message);
    }

  }

  loadAuthenticationInfo();