import "./import-jquery";
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'
import {goLoginPage,goHome} from "./pagenav.js";
import {EnvWebsite} from "/common/javascripts/tm-constant.js";
import { validateEmailOrPhoneInput } from "/common/javascripts/util.js";

import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

// Example starter JavaScript for disabling form submissions if there are invalid fields
// Form validation
(() => {
    'use strict'
  
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')
  
    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
      form.addEventListener('submit', event => {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }
  
        form.classList.add('was-validated')
      }, false)
    })
  })()




/**
 * 
 * 0.3 send email verification code
 */ 
 var inter;
 var count = 60; // 一般10或30或60s
function showCount() {
    $(".qrcode").text(count + "S");
    count--;
    if (count < 0) {
      resetCount();
    }
}

function resetCount(){
  clearInterval(inter);
  $(".qrcode").text("获取验证码");
  count = 60;
  $(".qrcode").attr("disabled", false);
}

 function sendVerificationCode  () {
  //校验 username must be : email or phone
  const flag = validatedUserName();
  // 发送验证码
  if (flag) {
      //触发重复行为：每隔一秒显示一次数字
      inter = setInterval(showCount, 1000);
      $(".qrcode").attr("disabled", true);

      // 请求服务器发送验证码
      $.post('/api/v1/web_mall/signup/send_qrcode',{ emailOrPhone: $("#identifierId").val()}, function(data) {

        if(data.code!=200){
          resetCount();
        }
         
         // 账号已经存在 2008
         if(data.code == 2008){
          $("#email-error-tip").text(data.message);
          $("#signup-form").removeClass('was-validated');
          $("#identifierId").removeClass("is-valid");
          $("#identifierId").addClass("invalid-input");
          return;
        }
        //  邮箱限制
        if(data.code == 40003){
          $("#email-error-tip").text(data.message);
          $("#password-reset-form").removeClass('was-validated');
          $("#identifierId").removeClass("is-valid");
          $("#identifierId").addClass("invalid-input");
          return;
        }
          //  短信限制
          if(data.code == 40036){
          $("#email-error-tip").text(data.message);
          $("#password-reset-form").removeClass('was-validated');
          $("#identifierId").removeClass("is-valid");
          $("#identifierId").addClass("invalid-input");
          return;
        }

        if(data.code!==200){
          const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+ data.message;
          customAlert.alert(error); 
        }



      })
  
  }
}




// 1. Sign up

var sendCodeEl = document.getElementById("send-verification-code");

sendCodeEl.addEventListener('click', () => {
  if (!sendCodeEl.disabled) {
    sendCodeEl.disabled = true;
    sendCodeEl.style.pointerEvents = "none";
    sendCodeEl.style.cursor = "none";
      setTimeout(() => {
        sendCodeEl.disabled = false;
        sendCodeEl.style.pointerEvents = "";
        sendCodeEl.style.cursor = "";
      }, 1000)
  }

  sendVerificationCode();

})

$("#identifierId").on("blur", function (e) {
  validatedUserName();
});

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

function validatedQrcode(){
  var flag = document.getElementById("qrcode").checkValidity();
  if (!flag) {
    $('#qrcode').addClass('is-invalid');
  }
  if (flag) {
    $('#qrcode').removeClass('is-invalid');
  }
  return flag;
}
function validatedUserRead(){
  var checkbox = document.getElementById('agree_term');
  if(!checkbox.checked){
     customAlert.alert("继续注册需要您同意《法律声明》、《隐私政策》")
  }
  return checkbox.checked;
}
function validatedPassword(){
  var flag = document.getElementById("identifierPassword").checkValidity();
  var password = $("#identifierPassword").val();
  var password2 = $("#identifierPassword2").val();
  if (!flag || password2 && password != password2) {
    $('#identifierPassword2').addClass('is-invalid');
  } else {
    $('#identifierPassword2').removeClass('is-invalid');
  }
  return flag;
}
function validatedConfirmPassword(){
  var flag = document.getElementById("identifierPassword2").checkValidity();
  var password = $("#identifierPassword").val();
  var password2 = $("#identifierPassword2").val();
  if (!flag || password2 && password != password2) {
    $('#identifierPassword2').addClass('is-invalid');
    $("#identifierId").addClass("invalid-input");
  } else {
    $('#identifierPassword2').removeClass('is-invalid');
    $('#identifierPassword2').removeClass('invalid-input');
  }
  return flag;
}

 
  function checkSignupFormValidity(){
    const flag = validatedUserName() && validatedQrcode() && validatedPassword() && validatedConfirmPassword() && validatedUserRead();

    return flag ;
  }

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

  const is_valid = checkSignupFormValidity();
  if(is_valid){
    doSignUp();
  }

})



function doSignUp(){

 

  var emailOrPhone = $('#identifierId').val();
  var password = $('#identifierPassword').val();
  var qrcode = $('#qrcode').val();

  var formData = {
    emailOrPhone: emailOrPhone,
    password: password,
    qrcode:qrcode
  }

  $.post('/api/v1/web_mall/email_or_phone_join',formData, function(data) {
         
        if(data.code === 200){
          // to login page
          goLoginPage();
        }
        // 无效验证码
        if(data.code == 40004){
          // alert fail
          $("#signup-form").removeClass('was-validated');
          $("#qrcode-error-tip").text(data.message);
          $("#qrcode").removeClass("is-valid");
          $("#qrcode").addClass("invalid-input");
        }
        // 账号已经存在 2008
        if(data.code == 2008){
          $("#email-error-tip").text(data.message);
          $("#signup-form").removeClass('was-validated');
          $("#identifierId").removeClass("is-valid");
          $("#identifierId").addClass("invalid-input");
        }

      })
        .fail(function(data) {
          // place error code here
          customAlert.alert('芜湖,系统裂开了！请稍后重试！')
        });
}

$("#identifierId").on("focus", function (e) {
    $("#email-error-tip").text("");
    $("#identifierId").removeClass("invalid-input");
  });
  $("#qrcode").on("focus", function (e) {
    $("#qrcode-error-tip").text("");
    $("#qrcode").removeClass("invalid-input");
  });
  $("#qrcode").on("change", function (e) {
    validatedQrcode();
  });
  $("#identifierPassword").on("change", function (e) {
     validatedPassword();
  });
  $("#identifierPassword2").on("change", function (e) {
     validatedConfirmPassword();
  });

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

    // get redirect url when login success
    const blv_uri_for_success=encodeURIComponent(document.referrer);
    var wechatLoginPageRedirectUrl=  encodeURIComponent(EnvWebsite.PROD_WWW+"/mall/wechat-login-redirect?to_page="+blv_uri_for_success);
    var wechatLoginPageUri = EnvWebsite.PROD_WX_QRCONNECT_URI+"?appid=" + EnvWebsite.PROD_WX_APPID + "&redirect_uri=" + wechatLoginPageRedirectUrl + "&response_type=code&scope=snsapi_login&state=3d6be0a4035d839573b04816624a415e#wechat_redirect";
  
    window.open(wechatLoginPageUri, '_blank');
  
  });