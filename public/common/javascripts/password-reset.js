import "./import-jquery";
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'
import {goLoginPage} from "./pagenav.js";
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
      $.post('/api/v1/web_mall/password_reset/qrcode',{emailOrPhone: $("#identifierId").val()}, function(data) {

        if(data.code!=200){
          resetCount();
        }
         
         // 账号不存在 2007
         if(data.code == 2007){
          $("#email-error-tip").text(data.message);
          $("#password-reset-form").removeClass('was-validated');
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

          if(data.code!=200){

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
  
    const is_valid = checkPasswordResetFormValidity();
    if(is_valid){
      doPasswrodReset();
    }
  
  })

 
  function checkPasswordResetFormValidity(){
    const flag = validatedUserName() && validatedQrcode() && validatedPassword() && validatedConfirmPassword();

    return flag ;
  }

function doPasswrodReset(){

 

  var emailOrPhone = $('#identifierId').val();
  var password = $('#identifierPassword').val();
  var qrcode = $('#qrcode').val();

  var formData = {
    emailOrPhone: emailOrPhone,
    password: password,
    qrcode:qrcode
  }

  $.post('/api/v1/web_mall/do_password_reset',formData, function(data) {
         
        if(data.code === 200){
          // to login page
          goLoginPage();
          return;
        }
        // 无效验证码
        if(data.code == 40004){
          // alert fail
          $("#password-reset-form").removeClass('was-validated');
          $("#qrcode-error-tip").text(data.message);
          $("#qrcode").removeClass("is-valid");
          $("#qrcode").addClass("invalid-input");
          return;
        }

        const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+ data.message;
        customAlert.alert(error); 


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



