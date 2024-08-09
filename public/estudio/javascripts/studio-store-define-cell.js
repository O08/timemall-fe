import "/common/javascripts/import-jquery.js";


import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"
import { getQueryVariable } from "/common/javascripts/util.js";
import { preHandleCellId ,addCellIdToUrl} from "/estudio/javascripts/compoent/DefineCellHelper.js";

import axios from 'axios';

import DefineCellCoverAndBanner from "/estudio/javascripts/compoent/DefineCellCoverAndBanner.js";


import {CellStatus,EventFeedScene} from "/common/javascripts/tm-constant.js";
import {goStudioStore} from "/common/javascripts/pagenav.js";

import {ContentediableComponent} from "/common/javascripts/contenteditable-compoent.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";
const RootComponent = {

    data() {
        return {
            btn_ctl: {
                activate_general_save_btn: false,
                activate_pricing_save_btn: false,
                activate_intro_save_btn: false,
                put_cell_plan_already_change: false
            },
            overview: {
                cover: "",
                title: "",
                canProvideInvoice: false,
                tags: []
            },
            pricing: {},
            content: {
                items: []
            },
            introCover: "",
            agree_check: false,
            cofingPlan:{},
            cellplan:{
                records:[]
            },
            cal_base_price: ""
        }
    },
    methods: {
        //tags
        removeTagV(index){
            this.overview.tags.splice(index, 1);
        },
        addTagV(event){
            addTag(event)
        },
        deleteContentOrTagV(event){
            deleteContentOrTag(event);

        },
        calAndFillPricingV(){
            calAndFillPricing();
        },
        validatePutCellPlanInput(){
            return !!this.cofingPlan.title && !!this.cofingPlan.content &&!!this.cofingPlan.price  && this.cofingPlan.price>0 && !!this.cofingPlan.feature;
        },
        planTypeToGradeV(planType){
            return planTypeToGrade(planType);
        },
        explainPlanTypeV(planType){
            return explainPlanType(planType);
        },
        showPlanConfigModalV(planType){
            this.cofingPlan={};// reset
            this.btn_ctl.put_cell_plan_already_change = false;
            const editPlan=getConfigPlan(planType);
            this.cofingPlan= JSON.parse(JSON.stringify(editPlan));

            $("#planConfigModal").modal("show");
        },
        putCellPlanV(){
            putCellPlan(this.cofingPlan);
        },
        initPage(){
            loadCellInfo();
            fetchCellPlan();
        },
        fetchCellPlanV(){
            fetchCellPlan();
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
        pannelRemoveText(index){
            removeText(index);
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
        },
        transformInputNumberToIntV(event){
            var val = Number(event.target.value.replace(/^(0+)|[^\d]+/g,''));// type int
            var min = Number(event.target.min);
            var max = Number(event.target.max);
            event.target.value = transformInputNumberToInt(val, min, max);
            if(val !== Number(event.target.value)){
              event.currentTarget.dispatchEvent(new Event('input')); // update v-model
            }
        }
    }
}
const app = createApp(RootComponent);
app.component('contenteditable', ContentediableComponent)
app.mixin(new Auth({need_permission : true,need_init: false}));
app.mixin(DirectiveComponent);
app.mixin(DefineCellCoverAndBanner);
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : false,
    scene: EventFeedScene.STUDIO,need_init: false
}));
app.mixin(ImageAdaptiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag == 'content'
}
app.mixin(new FriendListCompoent({need_init: false}));

app.mixin(
    new Ssecompoent({
        sslSetting:{
            need_init: false,
            onMessage: (e)=>{
                defineCellPage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);
const defineCellPage = app.mount('#app');
window.cDefineCell= defineCellPage;


// init
defineCellPage.initPage();
defineCellPage.userAdapter(); // auth.js
defineCellPage.fetchPrivateFriendV();// FriendListCompoent.js
defineCellPage.sseInitV();// Ssecompoent.js
defineCellPage.initEventFeedCompoentV(); // EventFeed.js
async function getCellInfo(cellId){
  const url = "/api/v1/web_estudio/cell/{cell_id}/profile".replace("{cell_id}",cellId);
  return await axios.get(url);
}

async function saveOverview(cellId,title,canProvideInvoice,tags,revshare){
    const url = "/api/v1/web_estudio/service/{cell_id}/define/overview".replace("{cell_id}",cellId);
    const param ={
        overview: {
            title: title,
            canProvideInvoice: canProvideInvoice,
            tags: tags,
            revshare: revshare
        }
    }
    return await axios.put(url,param)  
}


async function savePricingInfo(cellId,pricing){
    const url = "/api/v1/web_estudio/service/{cell_id}/define/pricing".replace("{cell_id}",cellId);
    return await axios.put(url,{pricing});  
}

async function saveCellIntroContent(cellId,content){
    const url = "/api/v1/web_estudio/services/{cell_id}/intro/content".replace("{cell_id}",cellId);
    return await axios.put(url,{content});  
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
async function doFetchCellPlan(cellId){
    const url="/api/v1/web_mall/services/{cell_id}/plan".replace("{cell_id}",cellId);
    return await axios.get(url);
}
async function doPutCellPlan(dto){
    const url="/api/v1/web_estudio/cell/plan";
    return await axios.put(url,dto);
}
function putCellPlan(dto){
   dto.cellId=getQueryVariable("cell_id");
   doPutCellPlan(dto).then(response=>{
    if(response.data.code==200){
        $("#planConfigModal").modal("hide");
        defineCellPage.fetchCellPlanV(); // fetch last data
    }
   });
}
function fetchCellPlan(){
    const cellId = getQueryVariable("cell_id");
    if(!cellId){
        return;
    }
    doFetchCellPlan(cellId).then(response=>{
        if(response.data.code==200){
           defineCellPage.cellplan=response.data.plan;
        }
    })
}
async function addTag(e){
    
    var tag = e.target.value.replace(/\s+/g, ' ');
    var tags=defineCellPage.overview.tags;
    if(tag.length > 0 && !tags.includes(tag)){
        if(tags.length < 5){
            defineCellPage.overview.tags.push(tag);
            defineCellPage.btn_ctl.activate_general_save_btn=true;
        }
    }
    e.target.value = "";

}
// tmp_global_val
var gl_tag_before_del='';
async function deleteContentOrTag(e){

    if (e.keyCode == 8 || e.keyCode == 46) {
        
        if(e.target.value.length==0 && gl_tag_before_del.length==0 && defineCellPage.overview.tags.length>0){
            defineCellPage.overview.tags.pop();
            defineCellPage.btn_ctl.activate_general_save_btn=true;
        }
    }
    gl_tag_before_del=e.target.value;

}
async function defineCellOverview(){

    const brandId=defineCellPage.getIdentity().brandId;
    const cellId =await preHandleCellId(brandId);
    if(!cellId){
        return;
    }
    const tagsJsonStr=JSON.stringify(defineCellPage.overview.tags);
    const revshare=defineCellPage.overview.revshare;
    saveOverview(cellId,defineCellPage.overview.title,defineCellPage.overview.canProvideInvoice,tagsJsonStr,revshare).then(function(response){
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
            defineCellPage.overview.canProvideInvoice = response.data.profile.provideInvoice==='1';
            defineCellPage.overview.tags=!response.data.profile.tags ? [] : response.data.profile.tags;
            defineCellPage.overview.revshare = response.data.profile.revshare;

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




function onOrOffSaleForCell(cellId,code){
     modifyCellMark(cellId,code).then(response=>{
        if(response.data.code == 200){
            goStudioStore();
            defineCellPage.agree_check = false;
        }
     });
}


function getConfigPlan(planType){
   var targetPlanArr= defineCellPage.cellplan.records.filter(e=>{return e.planType===planType});
   if(targetPlanArr.length>0){
     return targetPlanArr[0];
   }
   return {
     planType: planType,
     cellId: getQueryVariable("cell_id")
   };
}
function explainPlanType(planType){
  var planTypeDesc="";
  switch (planType) {
    case 'bird':
        planTypeDesc="小鸟"
        break;
    case 'eagle':
        planTypeDesc="老鹰"
        break;
    case 'albatross':
        planTypeDesc="信天翁"
        break;
    default:
        break;
  }
  return planTypeDesc;
}
function planTypeToGrade(planType){
    var grade="";
    switch (planType) {
      case 'bird':
        grade="基础"
          break;
      case 'eagle':
        grade="标准"
          break;
      case 'albatross':
        grade="高阶"
          break;
      default:
          break;
    }
    return grade;
}
function calAndFillPricing(){
    if(!defineCellPage.cal_base_price || Number(defineCellPage.cal_base_price)==0){
        return;
    }
    const val=defineCellPage.cal_base_price;
    defineCellPage.pricing.second=finalPrice((Number(val)/3600).toFixed(2),5000);
    defineCellPage.pricing.minute=finalPrice((Number(val)/60).toFixed(2),5000);
    defineCellPage.pricing.hour=finalPrice((Number(val)).toFixed(2),500000);
    defineCellPage.pricing.day=finalPrice((Number(val)*8).toFixed(2),5000000);
    defineCellPage.pricing.week=finalPrice((Number(val)*8*5).toFixed(2),50000000);
    defineCellPage.pricing.month=finalPrice((Number(val)*8*5*4).toFixed(2),50000000);
    defineCellPage.pricing.quarter=finalPrice((Number(val)*8*5*4*3).toFixed(2),50000000);
    defineCellPage.pricing.year=finalPrice((Number(val)*8*5*4*3*4).toFixed(2),500000000);
    defineCellPage.validatePricingInput();

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
        let url = "/estudio/studio-store-define-cell?tab="+ tab+ "&cell_id="+ id;
        history.pushState(null, "", url);
    }
}


function transformInputNumber(val,max){
    return  Number(val) > Number(max) ? max : val.split('').pop() === '.' || !val || val === '0.0' ? val : Number(val);
  }
 function finalPrice(val,max){

    if(val==0){
        return 0.01;
    }
    return val>max ? max : val;
    
 } 

 function transformInputNumberToInt(val,min,max){
    val = val ? val == 0 ? 0 : val : val; // cope with 0000000
    return val < min ? "" : val > max ? max : val;
  }

  $(function(){
	$(".tooltip-nav").tooltip();
});