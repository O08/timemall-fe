async function handleErrors(response) {
    if (!response.ok){
      throw Error(response.statusText);
    } 
    return response;
  }
async function doPostUserNeedStory(descriptions,budget,contactInfo){
   
    var form = new FormData();
    form.append("descriptions",descriptions);
    form.append("budget",budget);
    form.append("contactInfo",contactInfo);
    const url="/api/v1/web_mall/user_need_story";
    return await fetch(url,{method: "POST",body: form});

}

async function uploadUserNeedStory(){
    const descriptions=document.getElementById("input_need_description").value;
    const budget = document.getElementById("input_need_budget").value;
    const contactInfo=document.getElementById("input_need_contact").value;

    if(!descriptions){
      return;
    }

    const response =  await doPostUserNeedStory(descriptions,budget,contactInfo);
    await handleErrors(response);
    var data = await response.json();
    if(data.code==200){
       // close feedback offcanvas
       alert("您的反馈已提交成功，感谢反馈，我们承诺会快速处理您的反馈。祝愉快！");
       document.getElementById("input_need_description").value="";
       document.getElementById("input_need_budget").value="";
       document.getElementById("input_need_contact").value="";
       document.getElementById("closeUserNeedFeedbackOffcanvas").click();
    }
    if(data.code!=200){
      const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+data.message;
      alert(error); 
    }
}

document.getElementById('user-need-feedback-form').onsubmit=function (e) {

    // prevent default submit
        e.preventDefault();
        uploadUserNeedStory();
    
}
document.querySelector("#input_need_budget").addEventListener('keydown',event=>{
  transformInputNumberV(event);
})
function transformInputNumberV(event){
  var lastestVal=event.target.value+""+event.key;
  var val = Number(lastestVal.replace(/^(0+)|[^\d]+/g,''));// type int
  var min = Number(event.target.min);
  var max = Number(event.target.max);
  event.target.value = transformInputNumber(val, min, max);
  if(event.keyCode!=37&&event.keyCode!=39&&event.keyCode!=8){
    event.preventDefault=true;
    event.returnValue=false;
    event.key="";
    event.keyCode="";
  }

  

}
function transformInputNumber(val,min,max){
  return val < min ? "" : val > max ? max : val;
}
  
