import "/common/javascripts/import-jquery.js";


import { createApp } from "vue/dist/vue.esm-browser.js";
import Auth from "/estudio/javascripts/auth.js"
import { getQueryVariable } from "/common/javascripts/util.js";
import axios from 'axios';


const RootComponent = {
    data() {
        return {
            overview: {
                avator: "",
                title: ""
            },
            pricing: {},
            content: {
                items: []
            },
            introCover: "https://picsum.photos/1100/300",
            allown_next: false
        }
    },
    directives: {
        autoheight: {
            // 指令的定义
            mounted(el) {
                el.addEventListener("keyup", () => {
                    autoHeight(el);
                })
            }
            
        }
    },
    methods: {
        initPage(){
            loadCellInfo();
        },
        defineCellOverviewV(){
            defineCellOverview()
        },
        defineCellPricingV(){
            defineCellPricing()
        },
        setACellIntroContentV(){
            setACellIntroContent();
        },
        // text edit pannel
        pannelAddTextToFisrt(){
            addTextToFirst();
        },
        pannelAddText(index){
            nextText(index);
        },
        pannelRemoveText(){
            removeText();
        },
        // file handler
        previewCellCoverV(e){
            previewCellCover(e);
        },
        closeOverViewCoverModalHandlerV(){
            closeOverViewCoverModalHandler();
        },
        uploadCellCoverV(){
            uploadCellCover();
        },
        previewCellIntroBannerV(e){
            previewCellIntroBanner(e);
        },
        closeIntroBannerModalHandlerV(){
            closeIntroBannerModalHandler();
        },
        uploadCellIntroBannerV(){
            uploadCellIntroBanner();
        }
    }
}
const app = createApp(RootComponent);

app.mixin(new Auth({need_permission : true}));
const defineCellPage = app.mount('#app');
window.cDefineCell= defineCellPage;


// init
defineCellPage.initPage();

async function getCellInfo(cellId){
  const url = "/api/v1/web_mall/services/{cell_id}/intro".replace("{cell_id}",cellId);
  return await axios.get(url);
}

async function saveOverview(cellId,title,coverUrl){
    const url = "/api/v1/web_estudio/service/{cell_id}/define/overview".replace("{cell_id}",cellId);
    const param ={
        overview: {
            title: title,
            cover: coverUrl
        }
    }
    return await axios.put(url,param)  
}
async function requestCellId(){
    const brandId =  defineCellPage.getIdentity().brandId; // Auth.getIdentity();
   return await axios.get("/api/v1/web_estudio/services/initialize?brandId="+ brandId)
}

async function saveCellCoverImg(cellId, files){
    var fd = new FormData();
    fd.append('file', files);
    const url = "/api/v1/web_estudio/services/{cell_id}/cover".replace("{cell_id}",cellId);
    return await axios.put(url, fd);
}


async function savePricingInfo(cellId,pricing){
    const url = "/api/v1/web_estudio/service/{cell_id}/define/pricing".replace("{cell_id}",cellId);
    return await axios.put(url,{pricing})  
}

async function saveCellIntroContent(cellId,content){
    const url = "/api/v1/web_estudio/services/{cell_id}/intro/content".replace("{cell_id}",cellId);
    return await axios.put(url,{content})  
}

async function saveCellIntroBannerImg(cellId,files){
    var fd = new FormData();
    fd.append('file', files);
    const url = "/api/v1/web_estudio/services/{cell_id}/intro/cover".replace("{cell_id}",cellId);
    return await axios.put(url, fd);
}

async function defineCellOverview(){

    const cellId =await preHandleCellId();
    if(!cellId){
        return;
    }
    saveOverview(cellId,defineCellPage.overview.title).then(function(response){
        if(response.data.code == 200){
            addCellIdToUrl(cellId);
        }
    }); 
}
function defineCellPricing(){
    const cellId = getQueryVariable("cell_id");
    if(!cellId){
        return;
    }
    savePricingInfo(cellId,defineCellPage.pricing);
}
function setACellIntroContent(){
    const cellId = getQueryVariable("cell_id");
    if(!cellId){
        return;
    }
    saveCellIntroContent(cellId,defineCellPage.content);
}
function loadCellInfo(){
    const cellId = getQueryVariable("cell_id");
    if(!cellId){
        return;
    }
    getCellInfo(cellId).then(function(response){
        if(response.data.code == 200){
            defineCellPage.overview.title = response.data.profile.title;
            defineCellPage.overview.avator = response.data.profile.avator;
            if(response.data.profile.content){
                defineCellPage.content = response.data.profile.content;
            }
            initPricing(response.data.profile.fee);
            defineCellPage.introCover = response.data.profile.introCover;
        }
    })
}
function initPricing(pricingArr){
    defineCellPage.pricing.month = transferPrice(pricingArr,'month');
    defineCellPage.pricing.quarter = transferPrice(pricingArr,'quarter');
    defineCellPage.pricing.year = transferPrice(pricingArr,'year');
    defineCellPage.pricing.week = transferPrice(pricingArr,'week');
    defineCellPage.pricing.day = transferPrice(pricingArr,'day');
    defineCellPage.pricing.hour = transferPrice(pricingArr,'hour');
    defineCellPage.pricing.minute = transferPrice(pricingArr,'minute');
    defineCellPage.pricing.second = transferPrice(pricingArr,'second');
}
function transferPrice(arr,sbu){
 const obj = arr.filter(item => {return item.sbu === sbu})[0];
 return !obj ? "" : obj.price;
}
function addCellIdToUrl(cellId){
    const id = getQueryVariable("cell_id");
    if(!id){
        window.location.href = "/estudio/studio-store-define-cell.html?tab=pricing&cell_id="+ cellId
    }
}
async function preHandleCellId(){
    let cellId = getQueryVariable("cell_id");
    const option = getQueryVariable("option");
    if(option === "new" && !cellId){
        cellId =  (await requestCellId()).data.cellId;
    }
    return cellId;
}

// file handler---------
// 1. cell cover file handler
function previewCellCover(e){
    const file = e.target.files[0]
    const URL2 = URL.createObjectURL(file)
    document.querySelector('#coverPreview').src = URL2
    $("#overviewCoverModal").modal("show");
}
function closeOverViewCoverModalHandler(){
    document.querySelector('#coverPreview').src = "";
    document.querySelector('#coverFile').value = null;
}
async function uploadCellCover(){
    const cellId =await preHandleCellId();
    if(!cellId){
        return;
    }
    const file = $('#coverFile')[0].files[0];
    saveCellCoverImg(cellId,file).then((response)=>{
        if(response.data.code == 200){
            const url = URL.createObjectURL(file)
            document.querySelector('#lastestCover').src = url;

            $("#overviewCoverModal").modal("hide");
            document.querySelector('#coverPreview').src = "";
            addCellIdToUrl(cellId);
        }
    });
}

// 2. cell intro banner file handler
function previewCellIntroBanner(e){
    const file = e.target.files[0]

    const URL2 = URL.createObjectURL(file)
    document.querySelector('#introBannerPreview').src = URL2
    $("#introBannerModal").modal("show");
}
function closeIntroBannerModalHandler(){
    document.querySelector('#introBannerPreview').src = "";
    document.querySelector('#intro-banner-file').value = null;
}
function uploadCellIntroBanner(){
    const cellId = getQueryVariable("cell_id");
    if(!cellId){
        return;
    }
    const file = $('#intro-banner-file')[0].files[0];
    saveCellIntroBannerImg(cellId,file).then((response)=>{
        if(response.data.code == 200){
            const url = URL.createObjectURL(file)
            document.querySelector('#lastestBanner').src = url;

            $("#introBannerModal").modal("hide");
            document.querySelector('#introBannerPreview').src = "";
        }
    })
}


// edit pannel
function nextText(index){
    defineCellPage.content.items.splice(index,0,{section: ""});
}
function removeText(index){
    defineCellPage.content.items.splice(index,1);
}
function addTextToFirst(){
    defineCellPage.content.items.unshift({section: ""});
}

function showContent(){
    const tab = getQueryVariable("tab");
    const option = getQueryVariable("option");
    if(tab === "pricing" || option==='edit'){
       defineCellPage.allown_next = true;
    }
}
showContent();

function autoHeight(elem) {
    elem.style.height = "auto";
    elem.scrollTop = 0; // 防抖动
    elem.style.height = elem.scrollHeight + "px";
}