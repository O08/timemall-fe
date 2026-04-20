import "./import-jquery";
import {nextPageWhenLoginSuccess,goHome} from "./pagenav.js";
import {EnvWebsite} from "/common/javascripts/tm-constant.js";
import { validateEmailOrPhoneInput } from "/common/javascripts/util.js";


import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const currentDomain = window.location.hostname === 'localhost' ? EnvWebsite.LOCAL : EnvWebsite.PROD;

function validatedUserName(){
  const emailOrPhone = document.getElementById("identifierId").value;
  const flag = validateEmailOrPhoneInput(emailOrPhone);
  if(!flag)
  {
    $('#identifierId').addClass('is-invalid');
    document.getElementById("identifierId").setCustomValidity(false);

  }
  if(flag){
    $('#identifierId').removeClass('is-invalid');
    document.getElementById("identifierId").setCustomValidity('');

  }
  return flag;
}
function validatedPassword(){
  var flag = document.getElementById("identifierPassword").checkValidity();
  if (!flag) {
    $('#identifierPassword').addClass('is-invalid');
  }
  if (flag) {
    $('#identifierPassword').removeClass('is-invalid');
  }

  return flag;
}
$("#identifierId").on("blur", function (e) {
    const flag = validatedUserName();
  });

$("#identifierId").on("focus", function (e) {
    $("#email-error-tip").text("");
    $("#identifierId").removeClass("invalid-input");
  });
  $("#identifierPassword").on("focus", function (e) {
    $("#password-error-tip").text("");
    $("#identifierPassword").removeClass("invalid-input");
  });
  $("#identifierPassword").on("blur", function (e) {
    validatedPassword();
  });


// 2. login in

var el = document.getElementsByName("submitBtn")[0];

el.addEventListener('click', () => {
  if (!el.disabled) {
      el.disabled = true;
      el.style.pointerEvents = "none";
      el.style.cursor = "none";
      setTimeout(() => {
          el.disabled = false;
          el.style.pointerEvents = "";
          el.style.cursor = "";
      }, 1000)
  }

  if(validatedUserName() && validatedPassword()){
    doLogin();
  }

})



function doLogin(){

  var emailOrPhone = $('#identifierId').val();
  var password = $('#identifierPassword').val();
  const urlParams = new URLSearchParams(window.location.search);
  const redirect_uri = urlParams.get('redirect_uri');
  const state = urlParams.get('state');
  var formData = {
    username: emailOrPhone,
    password: password
  }
  // If OAuth 2 params exist, add them to the form data
  if (redirect_uri) {
    formData.redirect_uri = redirect_uri;
    formData.state = state;
  }

  $.post('/api/v1/web_mall/email_or_phone_sign_in',formData, function(data) {

    // SUCCESS(200, "Success"),
    // FAILED(503, "处理失败！"),


    // USER_NOT_LOGIN(2001, "用户未登录"),

    // USER_ACCOUNT_EXPIRED(2002, "账号已过期"),

    // USER_CREDENTIALS_ERROR(2003, "密码错误"),

    // USER_CREDENTIALS_EXPIRED(2004, "密码过期"),

    // USER_ACCOUNT_LOCKED(2006, "账号被锁定"),

    // USER_ACCOUNT_NOT_EXIST(2007, "账号不存在"),

    // USER_ACCOUNT_ALREADY_EXIST(2008, "账号已存在"),

    // USER_ACCOUNT_USE_BY_OTHERS(2009, "账号下线"),

    // USER_ACCOUNT_DISABLE(2005, "账号不可用")

        if(data.code === 200){
          // to login success handler
          // 清除所有缓存数据
          localStorage.clear();
          if (data.data && data.data.oauthRedirect) {
            // Redirect back to the AI or other platform
            window.location.href = data.data.oauthRedirect;
          } else {
            // Normal  login flow
            nextPageWhenLoginSuccess();
          }
        }
        if(data.code === 503){
          customAlert.alert('芜湖,系统裂开了！请稍后重试！')
        }
        if(data.code == 2007 || data.code == 2002 || data.code == 2005
          || data.code == 2006 || data.code == 2008 || data.code == 2009){
          // alert fail
          $("#email-error-tip").text(data.message);
          $("#login-form").removeClass('was-validated');
          $("#identifierId").removeClass("is-valid");
          $("#identifierId").addClass("invalid-input");
        }
        if(data.code == 2003 || data.code == 2004 ){
          // alert fail
          $("#password-error-tip").text(data.message);
          $("#login-form").removeClass('was-validated');
          $("#identifierPassword").removeClass("is-valid");
          $("#identifierPassword").addClass("invalid-input");
        }
      })
        .fail(function(data) {
          // place error code here
          customAlert.alert('芜湖,系统裂开了！请稍后重试！')
        });
}
async function fetchUserInfo(){
  const url="/api/v1/web_mall/me";
  return await fetch(url);
}
async function userHandler(){
  const response= await fetchUserInfo();
  var data = await response.json();
  if(data.code==200){
    goHome();
  }
}
userHandler();

$(".wechat-login").on("click", function (e) {

  const urlParams = new URLSearchParams(window.location.search);
  const oauth2_redirect = urlParams.get('redirect_uri');
  const oauth2_state = urlParams.get('state');

  // get redirect blv url when login success
  var blv_uri_for_success = encodeURIComponent(document.referrer);
  if (oauth2_redirect) {
    blv_uri_for_success="";
  }
  // Append Third platform context to  internal redirect URL
  var internalRedirect = currentDomain + "/mall/wechat-login-redirect?to_page=" + blv_uri_for_success;
  if (oauth2_redirect) {
    internalRedirect += "&third_auth=1&third_redirect_uri=" + encodeURIComponent(oauth2_redirect) + "&third_state=" + encodeURIComponent(oauth2_state || '');
  }

  var wechatLoginPageRedirectUrl = encodeURIComponent(internalRedirect);
  var wechatLoginPageUri = EnvWebsite.PROD_WX_QRCONNECT_URI + "?appid=" + EnvWebsite.PROD_WX_APPID + "&redirect_uri=" + wechatLoginPageRedirectUrl + "&response_type=code&scope=snsapi_login&state=3d6be0a4035d839573b04816624a415e#wechat_redirect";

  window.open(wechatLoginPageUri, '_blank');

});

