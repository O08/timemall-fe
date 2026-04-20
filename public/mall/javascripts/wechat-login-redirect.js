import { getQueryVariable } from "/common/javascripts/util.js";
import {goHome} from "/common/javascripts/pagenav.js";

import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

async function doLoadAuthenticationInfo(code,state,isThirdAuth,thirdRedirectUri,thirdState){
    const url="/api/v1/web_mall/do_wechat_qrCode_sign_in?wx_code="+code + "&wx_state=" + state;
    if(isThirdAuth === "1"){
        url += "&redirect_uri=" + encodeURIComponent(thirdRedirectUri) + 
        "&state=" + encodeURIComponent(thirdState || ''); 
    }

    return await fetch(url);
  }
  async function loadAuthenticationInfo(){

    const code = getQueryVariable("code");
    const state = getQueryVariable("state");
    const isThirdAuth = getQueryVariable("third_auth");
    const thirdRedirectUri = getQueryVariable("third_redirect_uri");
    const thirdState = getQueryVariable("third_state");
    if(!code || !state){
        customAlert.alert("警告：请停止非法操作");
    }
    const toPage=getQueryVariable("to_page");
    const response =  await doLoadAuthenticationInfo(code,state,isThirdAuth,thirdRedirectUri,thirdState);
    var data = await response.json();

    if(data.code == 200){
        // 清除所有缓存数据
        localStorage.clear();
        if (data.data && data.data.oauthRedirect) {
            window.location.href = data.data.oauthRedirect;
            return;
        }
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
        customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+data.message);
    }

  }

  loadAuthenticationInfo();