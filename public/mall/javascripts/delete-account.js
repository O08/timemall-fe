async function handleErrors(response) {
    if (!response.ok){
      throw Error(response.statusText);
    } 
    return response;
  }
var DataListModelEnum = Object.freeze({
    "USER_INTEREST": "user_interest",
    "USER_DEL_PRE_REQUIREMENT": "user_del_pre_requirement"
});

function showFocusModalV(){
    document.getElementById("delete_account_btn").disabled=false;
    var tips="删除账号操作不可撤销，数据不可找回，决定执行删除账号动作请点击【确定】按钮！";
    const giveUpInterest= document.getElementById("give_up_ri_check").checked;
    if(!giveUpInterest){
        tips="如果你确定继续删除账号操作，请勾选放弃权益！";
        document.getElementById("delete_account_btn").disabled=true;
    }
    const canDelete= !document.querySelector(".form-check-warning");
    if(!canDelete){
        tips="账号删除前置条件校验不通过，如果你确定继续删除账号操作，点击未勾选项目前往处理！";
        document.getElementById("delete_account_btn").disabled=true;
    }


    document.querySelector("#focusModal p").innerHTML=tips;

    $("#focusModal").modal("show"); // show modal
}
async function fetchUserPreRequirementsForDeleteAccount(){
    const url="/api/v1/web_mall/me/del_account_requirements";
    return await fetch(url);
}
async function fetchUserInterests(){
    const url="/api/v1/web_mall/me/interests";
    return await fetch(url);
}
async function doDelAccount(){
    const url="/api/v1/web_mall/account_delete";
    return await fetch(url,{method: "DELETE"});
}
async function doRefreshDataList(model){
    const url="/api/v1/web_mall/me/compute_ind";
    const dto={
        model: model
    }
    return await fetch(url,{method: "PUT",body: JSON.stringify(dto),headers:{
		'Content-Type':'application/json'
	}});
}
async function deleteAccount(){
    const response= await doDelAccount();
    await handleErrors(response);
    var data = await response.json();
    if(data.code==200){
        logout();
    }
    if(data.code!=200){
        const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+data.message;
        alert(error); 
    }
}
async function refreshDataList(model){
    const response= await doRefreshDataList(model);
    var data = await response.json();
    if(data.code==200 && model===DataListModelEnum.USER_INTEREST){
        displayUserInterests()
    }
    if(data.code==200 && model===DataListModelEnum.USER_DEL_PRE_REQUIREMENT){
        displayPreRequirements()
    }
}
function refreshUserInterestInd(){
    document.getElementById("refresh_interest_btn").setAttribute("disabled","disabled");
    refreshDataList(DataListModelEnum.USER_INTEREST);
    setTimeout('document.getElementById("refresh_interest_btn").removeAttribute("disabled")', 1500);

}
function refreshPreRequirement(){
    document.getElementById("refresh_rqm_btn").setAttribute("disabled","disabled");
    refreshDataList(DataListModelEnum.USER_DEL_PRE_REQUIREMENT);
    setTimeout('document.getElementById("refresh_rqm_btn").removeAttribute("disabled")', 1500);
}

async function displayUserInterests(){
    const response= await fetchUserInterests();
    var data = await response.json();
    if(data.code==200){
        renderUserInterest(data.interest.records);
    }
}
async function displayPreRequirements(){
    const response= await fetchUserPreRequirementsForDeleteAccount();
    var data = await response.json();
    if(data.code==200){
        renderUserPreRequirements(data.requirement.records);
    }
}
function renderUserInterest(interests){
    var tbody=document.querySelector(".section_rights_interests tbody");
    emptyAllChildNode(tbody);
    interests.forEach(element => {
        const tr = document.createElement("tr");

        const tdItem = document.createElement("td");
        const itemLink=document.createElement("a");
        itemLink.href=element.landUrl;
        itemLink.innerText=element.item;
        itemLink.setAttribute("class","land_link");

        const tdItemVal = document.createElement("td");
        tdItemVal.innerText=element.val;
        const fragment = document.createDocumentFragment();
        const trfragment= fragment.appendChild(tr);
        trfragment.appendChild(tdItem).appendChild(itemLink);
        trfragment.appendChild(tdItemVal);
        tbody.appendChild(fragment);

    });
    document.querySelector(".section_rights_interests .data_time_stamp").innerText=!interests.shift() ? "" : interests.shift().createAt+" 更新";
    
}


function renderUserPreRequirements(requirements){
    var tbody=document.querySelector(".section_requirements tbody");
    emptyAllChildNode(tbody);
    requirements.forEach(element => {
        const tr = document.createElement("tr");

        const tdCk=document.createElement("td");
        const div=document.createElement("div");
        div.setAttribute("class","form-check form-check-inline");
        const ck=document.createElement("input");
        ck.type="checkbox";
        if(element.currentVal!=element.targetVal){
            ck.setAttribute("class","form-check-input form-check-warning")
        }
        if(element.currentVal==element.targetVal){
            ck.setAttribute("class","form-check-input");
            ck.checked=true;
        }
        ck.disabled=true;

        const tdItem = document.createElement("td");
        const itemLink=document.createElement("a");
        itemLink.href=element.landUrl;
        itemLink.innerText=element.item;
        itemLink.setAttribute("class","land_link");

        const tdItemCur = document.createElement("td");
        tdItemCur.innerText=element.currentVal;

        const tdItemTarget = document.createElement("td");
        tdItemTarget.innerText=element.targetVal;

        const fragment = document.createDocumentFragment();
        const trfragment= fragment.appendChild(tr);

        trfragment.appendChild(tdCk).appendChild(div).appendChild(ck);
        trfragment.appendChild(tdItem).appendChild(itemLink);
        trfragment.appendChild(tdItemCur);
        trfragment.appendChild(tdItemTarget);


        tbody.appendChild(fragment);

    })
    document.querySelector(".section_requirements .data_time_stamp").innerText=!requirements.shift() ? "" : requirements.shift().createAt+" 更新";



}
//参数：e表示预删除所有子节点的父节点
function emptyAllChildNode (e) {
    while (e.firstChild) {
        e.removeChild (e.firstChild);
    }
}
displayUserInterests();
displayPreRequirements();


document.getElementById('delete-form').onsubmit=function (e) {

    // prevent default submit
        e.preventDefault();
        deleteAccount();
    
}