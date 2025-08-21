import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
// import InfiniteLoading from "v3-infinite-loading";
// import "v3-infinite-loading/lib/style.css"; 

import Auth from "/estudio/javascripts/auth.js"
import { getQueryVariable } from "/common/javascripts/util.js";
import axios from 'axios';
import {PriceSbu,BrandAccessWay} from "/common/javascripts/tm-constant.js";

import defaultCellPreviewImage from '/common/images/default-cell-preview.jpg';
import defaultAvatarImage from '/common/icon/panda-kawaii.svg';
import defaultBannerImage from '/common/images/default-brand-banner-4x3.svg';
import BubbleInviteComponent from "/mall/javascripts/component/BubbleInviteComponent.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 





const RootComponent = {
    data() {
        return {
            defaultCellPreviewImage,
            defaultAvatarImage,
            defaultBannerImage,
            homeInfo: {
                vr: []
            },
            cells: {},
            subscription: {
                records: [],
                queryParam: {
                    sellerBrandId: "",
                    current: 1,
                    size: 24,
                    loading: false,
                    pages: ""
                }
            },
            count: 10,
            queryParam: initQueryParam()
        }
    },
    methods: {
        goPlanShoppingPageV(plan){
            window.location.href="/"+this.homeInfo.sellerHandle+"/"+plan.productCode+"/"+plan.planId+"/subscription?planType=standard&mode=hard"
        },
        infinitePlanHandler(){
            infiniteSubscriptionPlan();
        },
        changeUrlTabV(tab){
            const url = window.location.pathname+"?tab="+tab;
            history.pushState(null, "", url);
        },
        loadHomeInfoV(){
            loadHomeInfo();
        },
        infiniteHandler(){
            infiniteBrandCell();
        },
        initServiceTabV(){
            initServiceTab();
        },
        transformSbuV(sbu){
            return PriceSbu.get(sbu);
        },
        loadBrandGuideV(){
            loadBrandGuide().then(response=>{
                if(response.data.code == 200){
                    this.homeInfo = response.data.responseContext.homeInfo;
                    renderPageMetaInfo(this.homeInfo.brand,this.homeInfo.brandTitle);

                    this.queryParam.brandId=this.homeInfo.browseBrandId;
                    this.cells=response.data.responseContext.cells.records;
                    this.queryParam.pages = response.data.responseContext.cells.pages;
                    this.subscription.queryParam.sellerBrandId=this.homeInfo.browseBrandId;
                    loadSubscriptionPlans(this.subscription.queryParam);

                }
            })
        }

    },
    updated(){
        
        $(function() {
            // Enable popovers 
            $('[data-bs-toggle="popover"]').popover();
        });
    }
}
const app = createApp(RootComponent);
app.mixin(new Auth({need_permission : false}));
app.mixin(BubbleInviteComponent);
app.mixin(DirectiveComponent);
app.mixin(ImageAdaptiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('content')
}

// app.component("infinite-loading", InfiniteLoading);
const bubblePage = app.mount('#app');
window.bubble = bubblePage;

// init 
// bubblePage.loadCellListsV();
bubblePage.loadBrandGuideV();


async function getBrandGuide(dto){
    const url = "/api/v1/web_mall/brand/guide";
    return await axios.post(url,dto);
}
async function fetchSubscriptionPlans(sellerBrandId,size,current){
    const url = "/api/public/brand/space/subscription/plan/query?size="+size+"&current="+current+"&sellerBrandId="+sellerBrandId;
    return await axios.get(url);
}
async function loadSubscriptionPlans(queryParam){
    fetchSubscriptionPlans(queryParam.sellerBrandId,queryParam.size,queryParam.current).then(response=>{
        if(response.data.code == 200){
            bubblePage.subscription.records.push(...response.data.plan.records);
            bubblePage.subscription.queryParam.pages=response.data.plan.pages;
        }
        bubblePage.subscription.queryParam.loading = false;
    });
}
async function loadBrandGuide(){
    const urlParam=window.location.pathname.split('/').pop();
    const brandId=getQueryVariable("brand_id");
    const originUrl=window.location.href;
    var accessWay=BrandAccessWay.BRAND;
    var param = urlParam;
    if(!!brandId){
         accessWay=BrandAccessWay.RAW;
         param=brandId;
    }
    if(urlParam.startsWith("@")){
        accessWay=BrandAccessWay.HANDLE;
    }
    const dto={
        originalUrl: originUrl,
        accessWay: accessWay,
        param: param
    }
    return getBrandGuide(dto);

}
function getBrandMutipleCell(param){
    var res = {};
    $.ajaxSetup({async: false});
    $.get('/api/v1/web_mall/brandCells', param,function(data) {
        if(data.code == 200){
            res = data.cells;

        }
        bubblePage.queryParam.loading = false;
       })
         .fail(function(data) {
            bubblePage.queryParam.loading = false;
         });
    return res;
 }

 function initQueryParam(){
    return {
      brandId: "",
      sbu: 'hour',
      current: 1,
      size: 12,
      loading: false
    }
   }

function initServiceTab(){
    if(!bubblePage.queryParam.brandId){
        return
    }
    const data = getBrandMutipleCell(bubblePage.queryParam);
    bubblePage.cells = data.records;
    bubblePage.queryParam.pages = data.pages;
    
}
function infiniteSubscriptionPlan(){
    if(!bubblePage.subscription.queryParam.sellerBrandId || bubblePage.subscription.queryParam.loading ){
        return
    }
    if(bubblePage.subscription.queryParam.current +1 > bubblePage.subscription.queryParam.pages){
        return ;
    }
    // loading data
    bubblePage.subscription.queryParam.loading = true;
    bubblePage.subscription.queryParam.current = bubblePage.subscription.queryParam.current + 1;
    loadSubscriptionPlans(bubblePage.subscription.queryParam);
}
function infiniteBrandCell(){

    if(!bubblePage.queryParam.brandId || bubblePage.queryParam.loading ){
        return
    }
    if(bubblePage.queryParam.current +1 > bubblePage.queryParam.pages){
        return ;
    
    }
    // loading data
    bubblePage.queryParam.loading = true;
    bubblePage.queryParam.current = bubblePage.queryParam.current + 1;
    const data =getBrandMutipleCell(bubblePage.queryParam);
    bubblePage.cells.push(...data.records);
    bubblePage.queryParam.pages = data.pages;
}



function renderPageMetaInfo(title,description){
    document.title = title + " 的品牌主页";
    var keywords="咘噜咓,bluvarri,up主商业化数字工作室,超级玩家,写作与翻译,原神超级玩家,视频与动画制作剪辑";
    document.getElementsByTagName('meta')["description"].content = description;
    document.getElementsByTagName('meta')["keywords"].content = keywords+","+title;
}


$(function(){
	$(".tooltip-nav").tooltip();
});

let navbar = document.getElementById("section-tabs");

let navPos = navbar.getBoundingClientRect().top;

window.addEventListener("scroll", e => {
  let scrollPos = window.scrollY;
  if (scrollPos > navPos) {
    navbar.classList.add('fixed');
  } else {
    navbar.classList.remove('fixed');
  }
});



function showContent(){
    var option = getQueryVariable("tab");
    if(!option){
        option="home";
    }

    switch(option){
        case "home":
            $("#home-tab").trigger("click");
            break; 
        case "service":
            $("#service-tab").trigger("click");
                break; 
        case "subscription":
            $("#subscription-tab").trigger("click");
                break; 
    }
    
}

showContent();