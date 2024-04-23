async function handleErrors(response) {
  if (!response.ok){
    throw Error(response.statusText);
  } 
  return response;
}
  
async function doLogout(){
    const url="/api/v1/web_mall/logout";
    return await fetch(url);
  }
  async function doFeedback(issue,attachment,contactInfo){
    var form = new FormData();
    form.append("issue",issue);
    form.append("contactInfo",contactInfo);
    if(!!attachment){
      form.append("attachment",attachment);
    }

    const url="/api/v1/web_mall/feedback";
    return await fetch(url,{method: "POST",body: form});
  }

async function logout(){
    const response= await doLogout();
    var data = await response.json();
    var isVuePage=document.querySelector(".button_user_vue");
    if(data.code==200 && !isVuePage){
        document.querySelector(".button_login").style.display="block";
        document.querySelector(".button_user").style.display="none";
        window.location.href="/welcome";
    }
    if(data.code==200 && !!isVuePage){
       window.location.href="/welcome";
    }
  }

  async function uploadFeedback(){
    const issue=document.getElementById("input_issue").value;
    const attachment=document.getElementById("input_issue_attachment").files[0];
    const contactInfo = document.getElementById("input_issue_contact").value;
    if(!issue){
      return;
    }

    const response =  await doFeedback(issue,attachment,contactInfo);
    await handleErrors(response);
    var data = await response.json();
    if(data.code==200){
       // close feedback offcanvas
       alert("您的反馈已提交成功，感谢反馈，我们承诺会快速处理您的反馈。祝愉快！");
       document.getElementById("input_issue").value="";
       document.getElementById("input_issue_attachment").value=null;
       document.getElementById("input_issue_contact").value="";
       document.querySelector('#lastestFeedbackAttachment').src = "";
       document.getElementById("closeFeedbackOffcanvas").click();


    }
    if(data.code!=200){
      const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+data.message;
      alert(error); 
    }

  }
   function previewFeedbackAttachment(){
    const attachment=document.getElementById("input_issue_attachment").files[0];
    const URL2 = URL.createObjectURL(attachment)
    document.querySelector('#lastestFeedbackAttachment').src = URL2;

  }

  document.getElementById('input_issue_attachment').onchange=function(e){
      previewFeedbackAttachment();
  }
  document.getElementById('feedback-form').onsubmit= async function (e) {

    // prevent default submit
        e.preventDefault();
        uploadFeedback();
    
  }
// logout     
var logoutbtn=document.getElementById('logout-btn');
if(!!logoutbtn){
   logoutbtn.onclick=async function() {
    logout();
  }
}

