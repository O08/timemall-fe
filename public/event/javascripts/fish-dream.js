const cureentPuzzleVersion="puzzle_v1";
const dreamItemTpmHasLike='<div class="dream_item"> <div class="dream_no"> <div class="ball"> <span> {{od}} </span> </div> </div> <div class="dream_content"> <div class="dream_story"> <p> {{content}} </p> </div> <div class="dream_like"> <div class="cnt"> <span class="me-2"> {{likes}} </span> <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M7.5 13.3749C7.5 15.1008 6.15686 16.4999 4.5 16.4999C2.84314 16.4999 1.5 15.1008 1.5 13.3749C1.5 12.295 2.67445 10.8537 3.55367 9.92602C4.07417 9.37687 4.92583 9.37687 5.44633 9.92602C6.32555 10.8537 7.5 12.295 7.5 13.3749Z" stroke="#3FA9F5" stroke-width="1.5"/> <path d="M16.5 13.3749C16.5 15.1008 15.1568 16.4999 13.5 16.4999C11.8432 16.4999 10.5 15.1008 10.5 13.3749C10.5 12.295 11.6744 10.8537 12.5536 9.92602C13.0741 9.37687 13.9259 9.37687 14.4464 9.92602C15.3256 10.8537 16.5 12.295 16.5 13.3749Z" stroke="#3FA9F5" stroke-width="1.5"/> <path d="M12 5.87489C12 7.6008 10.6568 8.99993 9 8.99993C7.34314 8.99993 6 7.6008 6 5.87489C6 4.79503 7.17445 3.35374 8.05365 2.42605C8.57415 1.87687 9.42585 1.87687 9.94635 2.42605C10.8256 3.35374 12 4.79503 12 5.87489Z" stroke="#3FA9F5" stroke-width="1.5"/> </svg> </div> <div onclick="likeDeream(\'{{id}}\',event)" class="like_btn"> <span class="px-2">点赞</span><svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M2.25 7.67565L2.81041 7.6272C2.78446 7.32709 2.5267 7.10069 2.22575 7.11368C1.9248 7.12666 1.6875 7.37442 1.6875 7.67565H2.25ZM15.1771 9.04305L14.6479 12.1028L15.7565 12.2946L16.2856 9.23475L15.1771 9.04305ZM9.93375 15.9375H6.44726V17.0625H9.93375V15.9375ZM5.76373 15.3094L5.15461 8.26485L4.0338 8.36175L4.64292 15.4063L5.76373 15.3094ZM14.6479 12.1028C14.2678 14.3008 12.286 15.9375 9.93375 15.9375V17.0625C12.8034 17.0625 15.2781 15.0607 15.7565 12.2946L14.6479 12.1028ZM9.9411 3.82511L9.44408 6.85854L10.5543 7.04044L11.0513 4.00702L9.9411 3.82511ZM5.3908 7.6842L6.46985 6.75439L5.73547 5.90216L4.65641 6.832L5.3908 7.6842ZM8.433 3.72905L8.78977 2.35366L7.70085 2.07118L7.34406 3.44656L8.433 3.72905ZM9.32865 2.08381L9.4374 2.11873L9.7815 1.04765L9.67275 1.01272L9.32865 2.08381ZM7.89263 5.11199C8.12655 4.67398 8.30828 4.21004 8.433 3.72905L7.34406 3.44656C7.2418 3.8408 7.09274 4.2217 6.90032 4.58193L7.89263 5.11199ZM9.4374 2.11873C9.6672 2.19256 9.8304 2.37007 9.88403 2.57688L10.973 2.29441C10.8189 1.70039 10.3642 1.23486 9.7815 1.04765L9.4374 2.11873ZM8.78977 2.35366C8.8161 2.2524 8.88922 2.15935 8.99985 2.10603L8.51145 1.09256C8.11245 1.28482 7.81275 1.6397 7.70085 2.07118L8.78977 2.35366ZM8.99985 2.10603C9.10087 2.05733 9.21982 2.04886 9.32865 2.08381L9.67275 1.01272C9.29048 0.889912 8.8734 0.91815 8.51145 1.09256L8.99985 2.10603ZM10.6153 8.23815H14.5011V7.11315H10.6153V8.23815ZM3.53911 16.0546L2.81041 7.6272L1.68959 7.7241L2.41829 16.1515L3.53911 16.0546ZM2.8125 16.1345V7.67565H1.6875V16.1345H2.8125ZM2.41829 16.1515C2.4084 16.0371 2.4986 15.9375 2.61503 15.9375V17.0625C3.15951 17.0625 3.58592 16.5959 3.53911 16.0546L2.41829 16.1515ZM11.0513 4.00702C11.1447 3.43692 11.1181 2.85359 10.973 2.29441L9.88403 2.57688C9.98978 2.98442 10.0092 3.40959 9.9411 3.82511L11.0513 4.00702ZM6.44726 15.9375C6.09183 15.9375 5.79451 15.6652 5.76373 15.3094L4.64292 15.4063C4.72389 16.3426 5.50702 17.0625 6.44726 17.0625V15.9375ZM6.46985 6.75439C6.97974 6.315 7.5294 5.792 7.89263 5.11199L6.90032 4.58193C6.64053 5.06825 6.22688 5.4787 5.73547 5.90216L6.46985 6.75439ZM16.2856 9.23475C16.4771 8.12738 15.6256 7.11315 14.5011 7.11315V8.23815C14.9261 8.23815 15.2499 8.62193 15.1771 9.04305L16.2856 9.23475ZM2.61503 15.9375C2.72469 15.9375 2.8125 16.0263 2.8125 16.1345H1.6875C1.6875 16.6465 2.10217 17.0625 2.61503 17.0625V15.9375ZM9.44408 6.85854C9.3258 7.58071 9.88245 8.23815 10.6153 8.23815V7.11315C10.5778 7.11315 10.5479 7.07926 10.5543 7.04044L9.44408 6.85854ZM5.15461 8.26485C5.13555 8.04435 5.22356 7.82835 5.3908 7.6842L4.65641 6.832C4.21517 7.21223 3.98362 7.78148 4.0338 8.36175L5.15461 8.26485Z" fill="#4CFFA9"/> </svg> </div> </div> </div> </div>';
const dreamItemTpmNoLike='<div class="dream_item"> <div class="dream_no"> <div class="ball"> <span> {{od}} </span> </div> </div> <div class="dream_content"> <div class="dream_story"> <p> {{content}} </p> </div> <div class="dream_like"> <div class="cnt"> <span class="me-2"> {{likes}} </span> <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M7.5 13.3749C7.5 15.1008 6.15686 16.4999 4.5 16.4999C2.84314 16.4999 1.5 15.1008 1.5 13.3749C1.5 12.295 2.67445 10.8537 3.55367 9.92602C4.07417 9.37687 4.92583 9.37687 5.44633 9.92602C6.32555 10.8537 7.5 12.295 7.5 13.3749Z" stroke="#3FA9F5" stroke-width="1.5"/> <path d="M16.5 13.3749C16.5 15.1008 15.1568 16.4999 13.5 16.4999C11.8432 16.4999 10.5 15.1008 10.5 13.3749C10.5 12.295 11.6744 10.8537 12.5536 9.92602C13.0741 9.37687 13.9259 9.37687 14.4464 9.92602C15.3256 10.8537 16.5 12.295 16.5 13.3749Z" stroke="#3FA9F5" stroke-width="1.5"/> <path d="M12 5.87489C12 7.6008 10.6568 8.99993 9 8.99993C7.34314 8.99993 6 7.6008 6 5.87489C6 4.79503 7.17445 3.35374 8.05365 2.42605C8.57415 1.87687 9.42585 1.87687 9.94635 2.42605C10.8256 3.35374 12 4.79503 12 5.87489Z" stroke="#3FA9F5" stroke-width="1.5"/> </svg> </div> </div> </div> </div> ';

var MarketingPuzzleEventTagEnum = Object.freeze({
    "CREATED": "1",
    "ALREADY_OPEN_BOX": "2",
    "END": "3"

});
var sanitizeHTML = function (str) {
	var temp = document.createElement('div');
	temp.textContent = str;
	return temp.innerHTML;
};
async function handleErrors(response) {
    if (!response.ok){
      throw Error(response.statusText);
    } 
    return response;
}
function showOpenBoxModalV(){
    $("#openBoxModal").modal("show"); // show modal
}
function showCreateStoryModalV(){
    $("#createStoryModal").modal("show"); // show modal
}


async function fetchPuzzleInfo(puzzleVersion){
    const url="/api/v1/marketing/puzzle?puzzleVersion="+puzzleVersion;
    return await fetch(url);
}
async function openTreasure(puzzleVersion,clueOne,clueTwo,clueThree){
    var form = new FormData();
    form.append("puzzleVersion",puzzleVersion);
    form.append("clueOne",clueOne);
    form.append("clueTwo",clueTwo);
    form.append("clueThree",clueThree);

    const url="/api/v1/marketing/puzzle/open";
    return await fetch(url,{method: "PUT",body: form});
}
async function fetchPuzzleDreams(q,puzzleVersion){
    const url="/api/v1/marketing/puzzle/dreams?q="+q+"&puzzleVersion="+puzzleVersion;
    return await fetch(url);
}
async function doLikeDream(dreamId){
    const url="/api/v1/marketing/puzzle/dreams/like";
    var form = new FormData();
    form.append("dreamId",dreamId);
    return await fetch(url,{method: "PUT",body: form});
}
async function doShareDream(story,puzzleVersion){
    const url="/api/v1/marketing/puzzle/dreams/story";
    const dto={
        story: story,
        puzzleVersion: puzzleVersion
    }
    return await fetch(url,{method: "POST",body: JSON.stringify(dto),headers:{
		'Content-Type':'application/json'
	}});
}





async function shareDream(){
    const story= document.querySelector("#input_stroy").value;
    if(!story){
        return;
    }
    const response= await doShareDream(story,cureentPuzzleVersion);
    await handleErrors(response);
    var data = await response.json();
    if(data.code==200){
        loadDreams("");
        closeShareModel();
    }
    if(data.code==2001){
        window.location.href="/login";
    }
    if(data.code!=200&&data.code!=2001){
        const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+data.message;
        alert(error); 
    }
}
async function likeDeream(dreamId,event){
    
    var el=event.currentTarget;

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
 
    const response= await doLikeDream(dreamId);
    var data = await response.json();
    if(data.code==200){
        loadDreams("");
    }
    if(data.code==2001){
        window.location.href="/login";
    }
    if(data.code!=200&&data.code!=2001){
        const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+data.message;
        alert(error); 
    }



}
async function openBox(){

    const clueOne=document.getElementById("input_clue_one");
    const clueTwo=document.getElementById("input_clue_two");
    const clueThree=document.getElementById("input_clue_three").value;
    if(!clueThree||clueOne.files.length==0||clueTwo.files.length==0){
        return;
    }
    const response= await openTreasure(cureentPuzzleVersion,clueOne.files[0],clueTwo.files[0],clueThree);
    await handleErrors(response);
    var data = await response.json();
    if(data.code==200){
        alert("恭喜你成功打开宝箱，奖金已经下发到您的账户，前往【咖核-账户】查看！"); 
        closeOpenBoxModel();

    }
    if(data.code==2001){
        window.location.href="/login";
    }
    if(data.code!=200&&data.code!=2001){
        const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+data.message;
        alert(error); 
    }
}
async function loadPuzzleInfo(){
    const response= await fetchPuzzleInfo(cureentPuzzleVersion);
    await handleErrors(response);
    var data = await response.json();
    if(data.code==200){
        setPuzzleInfo(data.puzzle);
    }
}
async function loadDreams(q){
    const response= await fetchPuzzleDreams(q,cureentPuzzleVersion);
    await handleErrors(response);
    var data = await response.json();
    if(data.code==200){
        renderDream(data.dream.records);
    }
}
function retrieveDream(){
    const q = document.querySelector(".top-search-input").value;
    loadDreams(q);
}
function renderDream(dreams){
    var dreamSection=document.querySelector(".section_dreams");
    var dreamItems="";
    dreams.forEach(e => {
        var d="";
        if(e.alreadyLike=='0'){
            d= dreamItemTpmHasLike.replace("{{od}}",e.od).replace("{{content}}",sanitizeHTML(e.content)).replace("{{likes}}",e.likes).replace("{{id}}",e.id);
        }
        if(e.alreadyLike=='1'){
            d= dreamItemTpmNoLike.replace("{{od}}",e.od).replace("{{content}}",sanitizeHTML(e.content)).replace("{{likes}}",e.likes);
        }
        dreamItems=dreamItems+d;
    });
    dreamSection.innerHTML=dreamItems;


}
function setPuzzleInfo(puzzle){
    var feed="";
    if(!!puzzle.od){
        feed=puzzle.od+"号 分享获得最多点赞，成功获得大秘宝资格。"
    }
    if(!!puzzle.od&&puzzle.tag===MarketingPuzzleEventTagEnum.CREATED&&puzzle.currentBrand==puzzle.winner){
        feed=feed+"<a href='"+puzzle.pieceWhere+"'>领取</a>"
    }


    document.querySelector("#winner_info").innerHTML=feed;
    if(puzzle.tag===MarketingPuzzleEventTagEnum.CREATED){
        document.querySelector(".open-treasure").innerHTML="提交碎片，开启宝箱";
    }
    if(puzzle.tag!==MarketingPuzzleEventTagEnum.CREATED){
        document.querySelector(".open-treasure").innerHTML="宝箱已被打开，寻宝结束";
        document.querySelector(".open-treasure").setAttribute("disabled","disabled");
    }
    document.getElementById("puzzle_time").innerHTML=puzzle.beginAt+" ~ "+puzzle.endAt;
}
function previewCluenOne(){
    const piece=document.getElementById("input_clue_one").files[0];
    const URL2 = URL.createObjectURL(piece)
    document.querySelector('#lastestClueOneAttachment').src = URL2;

}
function previewCluenTwo(){
    const piece=document.getElementById("input_clue_two").files[0];
    const URL2 = URL.createObjectURL(piece)
    document.querySelector('#lastestClueTwoAttachment').src = URL2;

}
function closeShareModel(){
    document.querySelector('#input_stroy').value = "";

    $("#createStoryModal").modal("hide"); // show modal

}
function closeOpenBoxModel(){
    $("#openBoxModal").modal("hide"); // show modal
    document.getElementById("input_clue_one").value=null;
    document.getElementById("input_clue_two").value=null;
    document.getElementById("input_clue_three").value="";


    document.querySelector('#lastestClueOneAttachment').removeAttribute("src");
    document.querySelector('#lastestClueTwoAttachment').src = "";



}



document.getElementById('create_story_form').onsubmit=function (e) {

    // prevent default submit
        e.preventDefault();
        shareDream();
}
document.getElementById('open_box-form').onsubmit=function (e) {

    // prevent default submit
        e.preventDefault();
        openBox();
}
document.querySelector('.top-search-input').onkeydown = function(e){
    if(e.key === "Enter"){
        retrieveDream();
    }
 };
// init
loadPuzzleInfo();
loadDreams("");