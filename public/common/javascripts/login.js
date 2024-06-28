import "./import-jquery";
import {nextPageWhenLoginSuccess,goHome} from "./pagenav.js";


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

$("#email").on("focus", function (e) {
    $("#email-error-tip").text("");
    $("#email").removeClass("invalid-input");
  });
  $("#password").on("focus", function (e) {
    $("#password-error-tip").text("");
    $("#password").removeClass("invalid-input");
  });
  $("#password").on("blur", function (e) {
    var flag = document.getElementById("password").checkValidity();
    if (!flag) {
      $('#password').addClass('is-invalid');
    }
    if (flag) {
      $('#password').removeClass('is-invalid');
    }
  });


// 2. login in
$("#login-form").on("submit", function (e) {

    // prevent default submit
    e.preventDefault();
    document.getElementsByName("submitBtn")[0].disabled=true;// prevent repeat submit
    if(e.target.checkValidity()){
        doLogin();
    }
    document.getElementsByName("submitBtn")[0].disabled=false;


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
          nextPageWhenLoginSuccess();
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