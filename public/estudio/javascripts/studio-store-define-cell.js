import "/common/javascripts/import-jquery.js";


import { createApp,ref } from "vue/dist/vue.esm-browser.js";
import Auth from "/estudio/javascripts/auth.js"
import { getQueryVariable } from "/common/javascripts/util.js";
import axios from 'axios';

import BrandInfoComponent from "/estudio/javascripts/load-brandinfo.js";

import {CellStatus} from "/common/javascripts/tm-constant.js";
import {goStudioStore} from "/common/javascripts/pagenav.js";

import {ContentediableComponent} from "/common/javascripts/contenteditable-compoent.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
const RootComponent = {

    data() {
        return {
            btn_ctl: {
                activate_general_save_btn: false,
                activate_pricing_save_btn: false,
                activate_intro_save_btn: false
            },
            overview: {
                cover: "",
                title: ""
            },
            pricing: {},
            content: {
                items: []
            },
            introCover: "https://picsum.photos/1100/300",
            agree_check: false
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
        },
        onlineCell(){
            // code 1--draft ; 2--onsale; 3--offsale;
            const cellId = getQueryVariable("cell_id");
            if(!cellId){
                return;
            }
            onOrOffSaleForCell(cellId,CellStatus.Online);
        },
        currentTabIntV(currentTab){
            return currentTabInt(currentTab);
        },
        validatePricingInput(){
            var pricing = this.pricing;
            this.btn_ctl.activate_pricing_save_btn = 
                   pricing.second>0 && pricing.minute>0 && pricing.hour>0 && pricing.day>0
                   &&pricing.week>0 && pricing.month>0 && pricing.quarter>0 && pricing.year>0;
        },
        transformInputNumberV(event){

            var val = event.target.value.match(/\d+(\.\d{0,2})?/) ? event.target.value.match(/\d+(\.\d{0,2})?/)[0] : '';// type positve number
            var max = event.target.max;
            event.target.value = transformInputNumber(val, max);
            if(Number(val) !== Number(event.target.value)){
              event.currentTarget.dispatchEvent(new Event('input')); // update v-model
            }
        }
    }
}
const app = createApp(RootComponent);
app.component('contenteditable', ContentediableComponent)
app.mixin(new Auth({need_permission : true}));
app.mixin(BrandInfoComponent);
app.mixin(DirectiveComponent);

const defineCellPage = app.mount('#app');
window.cDefineCell= defineCellPage;


// init
defineCellPage.initPage();

async function getCellInfo(cellId){
  const url = "/api/v1/web_estudio/cell/{cell_id}/profile".replace("{cell_id}",cellId);
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
    return await axios.put(url,{pricing});  
}

async function saveCellIntroContent(cellId,content){
    const url = "/api/v1/web_estudio/services/{cell_id}/intro/content".replace("{cell_id}",cellId);
    return await axios.put(url,{content});  
}

async function saveCellIntroBannerImg(cellId,files){
    var fd = new FormData();
    fd.append('file', files);
    const url = "/api/v1/web_estudio/services/{cell_id}/intro/cover".replace("{cell_id}",cellId);
    return await axios.put(url, fd);
}
/**
 * 
 * @param {*} cellId  cell id
 * @param {*} code 1--draft ; 2--onsale; 3--offsale;
 */
 async function modifyCellMark(cellId,code){
    var url = "/api/v1/web_estudio/services/{cell_id}/mark".replace("{cell_id}",cellId);
    url= url + "?code=" + code;
    return await axios.put(url);
} 

async function defineCellOverview(){

    const cellId =await preHandleCellId();
    if(!cellId){
        return;
    }
    saveOverview(cellId,defineCellPage.overview.title).then(function(response){
        if(response.data.code == 200){
            addCellIdToUrl(cellId);
            defineCellPage.btn_ctl.activate_general_save_btn = false;
        }
    }); 
}
function defineCellPricing(){
    const cellId = getQueryVariable("cell_id");
    if(!cellId){
        return;
    }
    savePricingInfo(cellId,defineCellPage.pricing).then(response=>{
        if(response.data.code == 200){
            changeUrlTabWithoutRefreshPage("intro");
            defineCellPage.btn_ctl.activate_pricing_save_btn = false;
        }
    });
}
function setACellIntroContent(){
    const cellId = getQueryVariable("cell_id");
    if(!cellId){
        return;
    }
    saveCellIntroContent(cellId,defineCellPage.content).then(response=>{
        if(response.data.code == 200){
            changeUrlTabWithoutRefreshPage("publish");
            defineCellPage.btn_ctl.activate_intro_save_btn = false;
        }
    });
}
function loadCellInfo(){
    const cellId = getQueryVariable("cell_id");
    if(!cellId){
        return;
    }
    getCellInfo(cellId).then(function(response){
        if(response.data.code == 200){
            defineCellPage.overview.title = response.data.profile.title;
            defineCellPage.overview.cover = response.data.profile.cover;
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
        let url = "/estudio/studio-store-define-cell.html?tab=pricing&cell_id="+ cellId
        history.pushState(null, "", url);
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


function onOrOffSaleForCell(cellId,code){
     modifyCellMark(cellId,code).then(response=>{
        if(response.data.code == 200){
            goStudioStore();
            defineCellPage.agree_check = false;
        }
     });
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

function currentTabInt(currentTab){
    const tab = getQueryVariable("tab");
    const option = getQueryVariable("option");

    var navIntMap = new Map();
    navIntMap.set("general",1);
    navIntMap.set("pricing",2);
    navIntMap.set("intro",3);
    navIntMap.set("publish",4);
    // if edit open all
    return option === "edit" ? 4 < currentTab : navIntMap.get(tab) < currentTab;
}

function changeUrlTabWithoutRefreshPage(tab){
    const id = getQueryVariable("cell_id");
    if(id){
        let url = "/estudio/studio-store-define-cell.html?tab="+ tab+ "&cell_id="+ id;
        history.pushState(null, "", url);
    }
}


function transformInputNumber(val,max){
    return  Number(val) > Number(max) ? max : val.split('').pop() === '.' || !val || val === '0.0' ? val : Number(val);
  }
