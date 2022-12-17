import "./import-jquery";
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'
import {goHome,goLoginPage,goBackAndReload} from "./pagenav.js";




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
     console.log(count);
    $(".qrcode").text(count + "S");
    count--;
    if (count < 0) {
        clearInterval(inter);
        $(".qrcode").text("获取邮箱验证码");
        count = 60;
        $(".qrcode").attr("disabled", false);
    }
}

 function sendEmailVerificationCode  () {
  //校验email  
  const flag = document.getElementById("email").checkValidity();
  // 发送验证码
  if (flag) {
      //触发重复行为：每隔一秒显示一次数字
      inter = setInterval(showCount, 1000);
      $(".qrcode").attr("disabled", true);

      // 请求服务器发送验证码
      $.post('/api/v1/web_mall/send_email_code',{email: $("#email").val()}, function(data) {
         
        console.log(data);

      })
  
  }
}




// 1. Sign up

$("#send-email-verification-code").on("click", function (e) {
    sendEmailVerificationCode()
});
$("#email").on("blur", function (e) {
  const flag = document.getElementById("email").checkValidity();
  if(!flag)
  {
    $('#email').addClass('is-invalid');
  }
  if(flag){
    $('#email').removeClass('is-invalid');
  }
});

  $("#signup-form").on("submit", function (e) {

    // prevent default submit
    e.preventDefault();
    const is_valid = checkSignupFormValidity();
    if(is_valid){
      doSignUp();
    }

  });
 
  function checkSignupFormValidity(){
    const flag = document.getElementById('signup-form').checkValidity();
    const password = $("#password").val();
    const password2 = $("#password2").val();
    return flag && password === password2;
  }

function doSignUp(){

 

  var email = $('#email').val();
  var password = $('#password').val();
  var qrcode = $('#qrcode').val();

  var formData = {
    email: email,
    password: password,
    qrcode:qrcode
  }

  $.post('/api/v1/web_mall/email_join',formData, function(data) {
         
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
          $("#email").removeClass("is-valid");
          $("#email").addClass("invalid-input");
        }

      })
        .fail(function(data) {
          // place error code here
            alert('芜湖,系统裂开了！请稍后重试！')
        });
}

// 2. login in
$("#login-form").on("submit", function (e) {

    // prevent default submit
    e.preventDefault();
    doLogin();

});



function doLogin(){

  var email = $('#email').val();
  var password = $('#password').val();

  var formData = {
    username: email,
    password: password
  }

  $.post('/api/v1/web_mall/email_sign_in',formData, function(data) {

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
          goBackAndReload();
        }
        if(data.code === 503){
          alert('芜湖,系统裂开了！请稍后重试！')
        }
        if(data.code == 2007 || data.code == 2002 || data.code == 2005
          || data.code == 2006 || data.code == 2008 || data.code == 2009){
          // alert fail
          $("#email-error-tip").text(data.message);
          $("#login-form").removeClass('was-validated');
          $("#email").removeClass("is-valid");
          $("#email").addClass("invalid-input");
        }
        if(data.code == 2003 || data.code == 2004 ){
          // alert fail
          $("#password-error-tip").text(data.message);
          $("#login-form").removeClass('was-validated');
          $("#password").removeClass("is-valid");
          $("#password").addClass("invalid-input");
        }
      })
        .fail(function(data) {
          // place error code here
          alert('芜湖,系统裂开了！请稍后重试！')
        });
}


