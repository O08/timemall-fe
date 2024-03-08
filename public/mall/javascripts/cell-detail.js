import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import Auth from "/estudio/javascripts/auth.js";
import {goLoginPage} from "/common/javascripts/pagenav.js";
import { getQueryVariable } from "/common/javascripts/util.js";
import { copyValueToClipboard } from "/common/javascripts/share-util.js";
import { uploadCellDataLayerWhenClick,uploadCellDataLayerWhenAppointment,uploadCellDataLayerWhenBuyPlan } from "/common/javascripts/science.js";



import {PriceSbu} from "/common/javascripts/tm-constant.js";
import axios from 'axios';
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import defaultAvatarImage from '/avator.webp';
import defaultBrandBannerImage from '/common/images/default-brand-banner.jpg';
import defaultExperienceImage from '/common/images/default-experience.jpg';
import defaultCellIntroCoverImage from '/common/images/default-cell-intro-cover.jpg'

import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import {EmailNoticeEnum,CellPlanType} from "/common/javascripts/tm-constant.js";
import {getLinkIconUrl,parseLinkUri} from "/common/javascripts/compoent/link-icon-parse.js";



const RootComponent = {
    data() {
        return {
            error:{},
            defaultAvatarImage,
            defaultExperienceImage,
            defaultBrandBannerImage,
            defaultCellIntroCoverImage,
            profile: {
                content:[],
                dataLoadFinish: false
            },
            selectedSbu: '',
            total: 0,
            quantity: "",
            cellplan: {
                records: []
            },
            displayPlan:{},
            focusModal:{
                feed: "",
                confirmHandler:()=>{

                }
            }
        }
    },
    methods: {
        parseLinkUriV(uri){
          return parseLinkUri(uri);
        },
        getLinkIconUrlV(url){
          return getLinkIconUrl(url);
        },
        explainCellPlanTypeV(planType){
            return explainCellPlanType(planType);
        },
        showOrderCellPlanFocusModalV(){
            this.focusModal.feed="您即将购买单品："+ this.explainCellPlanTypeV(this.displayPlan.planType);
            this.focusModal.confirmHandler=()=>{
                this.orderCellPlanV();
                $("#focusModal").modal("hide"); // show modal

            };
            $("#focusModal").modal("show"); // show modal
        },
        hasCellPlanV(planType){
          return this.cellplan.records.filter(item=>item.planType===planType).length>0;
        },
        configRenderPlanV(planType){
            if(!this.isEmptyObjectV(this.cellplan.records)){
                this.displayPlan=this.cellplan.records.filter(item=>item.planType===planType)[0];
            }
        },
        fetchCellPlanV(){
            fetchCellPlan();
        },
        orderCellPlanV(){
            orderCellPlan(this.displayPlan.planId);
        },
        uploadCellDataLayerClicksV(){
            const cellId= getQueryVariable("cell_id");
            if(!cellId){
                return;
            }
            uploadCellDataLayerWhenClick([cellId]);
        },
        loadCellInfoV(){
            const cellId= getQueryVariable("cell_id");
            if(!cellId){
                return;
            }
            getIntroInfoForCell(cellId).then(response=>{
                if(response.data.code == 200){
                    this.profile = response.data.profile;
                    if(!this.profile.content){
                        this.profile.content = []
                    }
                    var description=this.profile.content.items.length>0 ?  this.profile.content.items[0].section : "";

                    renderPageMetaInfo(this.profile.title,description);
                    renderStructuredDataForSEO(this.profile);
                }
                this.profile.dataLoadFinish = true;

            });
            
        },
        orderNowV(){
            orderNow()
        },
        transformSbuV(sbu){
            return PriceSbu.get(sbu);
        },
        transformInputNumberV(event){
            var val = Number(event.target.value.replace(/^(0+)|[^\d]+/g,''));// type int
            var min = Number(event.target.min);
            var max = Number(event.target.max);
            event.target.value = transformInputNumber(val, min, max);
            if(val !== Number(event.target.value)){
              event.currentTarget.dispatchEvent(new Event('input')); // update v-model
            }
        },
        computeTotalFeeV(){
            computeTotalFee()
        },
        isEmptyObjectV(obj){
            return $.isEmptyObject(obj);
        },
        copyWindowUrlToClipboardV(productTitle){
            const content = "【Bluvarri】 " + window.location.href + " 「 " +productTitle + "」 点击链接直接打开 或者 Bluvarri 搜索直接打开 ";
            copyValueToClipboard(content);
        }
    },
    created(){
      this.loadCellInfoV();
      this.fetchCellPlanV();
      this.uploadCellDataLayerClicksV();
    },
    updated(){
        
        $(function() {
            // Enable popovers 
            $('[data-bs-toggle="popover"]').popover();
        });
    }
}
const SellerComponent = {
    data() {
        return {
            brandProfile: {}
        }
    },
    methods: {
       loadBrandInfoV(){
           const brandId= getQueryVariable("brand_id");
            if(!brandId){
                return;
            }
            getBrandProfile(brandId).then(response=>{
                if(response.data.code == 200){
                    this.brandProfile = response.data.profile;
                }
            })
       }
    },
    created(){
        this.loadBrandInfoV();
    }
    
}
const app = createApp(RootComponent);
app.mixin(SellerComponent);
app.mixin(new Auth({need_permission : false}));
app.mixin(DirectiveComponent);
app.mixin(ImageAdaptiveComponent);

const cellDetailPage = app.mount('#app');


window.cellDetail = cellDetailPage;
/**
 * intro -------------
 */
async function getIntroInfoForCell(cellId){
    const url = "/api/v1/web_mall/services/{cell_id}/intro".replace("{cell_id}",cellId);
    return await axios.get(url);
}
async function order(cellId){
    const dto= {
        sbu: cellDetailPage.selectedSbu,
        quantity: cellDetailPage.quantity
    }
    const url = "/api/v1/web_mall/services/{cell_id}/order".replace("{cell_id}",cellId);
    return await axios.post(url,dto); 
}
async function doSendOrderReceivingEmail(dto){
    const url="/api/v1/web_mall/email_notice";
    return await axios.post(url,dto);
}
async function doFetchCellPlan(cellId){
    const url="/api/v1/web_mall/services/{cell_id}/plan".replace("{cell_id}",cellId);
    return await axios.get(url);
}
async function doOrderCellPlan(planId){
    const url="/api/v1/web_mall/services/plan/{id}/order".replace("{id}",planId);
    return await axios.post(url);
}
function orderCellPlan(planId){
     // 用户未登录，跳到登录页面
    if(!cellDetailPage.user_already_login){
        goLoginPage();
        return
    }
    cellDetailPage.error={};
    doOrderCellPlan(planId).then(response=>{
        if(response.data.code==200){
            sendOrderReceivingEmail(EmailNoticeEnum.CELL_PLAN_ORDER_RECEIVING,response.data.planOrderId);
            // scinece data
            const cellId = getQueryVariable("cell_id");
            uploadCellDataLayerWhenBuyPlan(cellDetailPage.displayPlan.planType,cellId);

            $("#goTopUpModal").modal("show"); 
        }
        if(response.data.code!=200){
            $("#goTopUpModal").modal("show"); 
            cellDetailPage.error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
        }

    }).catch(error=>{
        $("#goTopUpModal").modal("show"); 
        cellDetailPage.error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error;
    });
}
function fetchCellPlan(){
    const cellId = getQueryVariable("cell_id");
    if(!cellId){
        return;
    }
    doFetchCellPlan(cellId).then(response=>{
        if(response.data.code==200){
           cellDetailPage.cellplan=response.data.plan;
           setDisplayPlan();
        }
    })
}


function orderNow(){
    const cellId= getQueryVariable("cell_id");
    if(!cellId || !cellDetailPage.total || !cellDetailPage.quantity 
        || cellDetailPage.total<=0 || cellDetailPage.quantity<=0){
            alert("请选择需要预约的服务数量与标准付费单元");
            return
    }
    // 用户未登录，跳到登录页面
    if(!cellDetailPage.user_already_login){
        goLoginPage();
        return
    }
    order(cellId).then(response=>{
        if(response.data.code == 200){
            // notice supplier
            sendOrderReceivingEmail(EmailNoticeEnum.CELL_ORDER_RECEIVING,response.data.orderId);
            // reset 
            cellDetailPage.quantity ="";
            cellDetailPage.total = 0;

            // science data
            uploadCellDataLayerWhenAppointment([cellId]);

            // give option
            alert("成功预约，可在E-pod查看预约记录");

        }
    })
}
function sendOrderReceivingEmail(noticeType,orderId){
    const dto={
        noticeType: noticeType,
        ref: JSON.stringify({orderId: orderId})
    }
    doSendOrderReceivingEmail(dto);
}
function setDisplayPlan(){
    var planType="albatross";
    if(cellDetailPage.hasCellPlanV(planType)){
        cellDetailPage.displayPlan=cellDetailPage.cellplan.records.filter(item=>item.planType===planType)[0]
    }
    var planType="eagle";
    if(cellDetailPage.hasCellPlanV(planType)){
        cellDetailPage.displayPlan=cellDetailPage.cellplan.records.filter(item=>item.planType===planType)[0]
    }
    var planType="bird";
    if(cellDetailPage.hasCellPlanV(planType)){
        cellDetailPage.displayPlan=cellDetailPage.cellplan.records.filter(item=>item.planType===planType)[0]
    }
}
function explainCellPlanType(planType){
    var planTypeDesc="";
    switch(planType){
        case CellPlanType.BIRD:
            planTypeDesc="小鸟";
            break; 
        case CellPlanType.EAGLE:
            planTypeDesc="老鹰";
            break; 
        case CellPlanType.ALBATROSS:
            planTypeDesc="信天翁";
            break; 
    }
    return planTypeDesc;

}
function getSbuPrice()
{
   const selectedFee = cellDetailPage.profile.fee.filter(item=>item.sbu===cellDetailPage.selectedSbu)[0];
   return selectedFee.price;
}
function computeTotalFee(){
    if(cellDetailPage.selectedSbu === "" || !cellDetailPage.quantity ){
        cellDetailPage.total = 0;
        return ;
    }
    cellDetailPage.total  = getSbuPrice() * cellDetailPage.quantity;
}

function renderPageMetaInfo(title,description){
    document.title = title + " - 市场";
    var keywords="咘噜咓,bluvarri,up主商业化数字工作室,游戏玩家服务,写作与翻译,原神游戏玩家服务,视频与动画制作剪辑";
    document.getElementsByTagName('meta')["description"].content = description;
    document.getElementsByTagName('meta')["keywords"].content = keywords+","+title;
}

function renderStructuredDataForSEO(product){
    var url=window.location.origin + "/mall/cell-detail.html?cell_id=" + product.id + "&brand_id=" + product.brandId;
    var description=product.content.items.map(obj => obj.section).join("\n");
    var price=product.fee.filter(e=>e.sbu==="hour")[0].price;

    doRenderStructuredDataForSEO(product.title,description,url,price,product.cover);
}

function doRenderStructuredDataForSEO(name,description,url,price,image){
    var structuredDataText={
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": name,
        "description": description,
        "image": image,
        "offers": {
            "@type": "Offer",
            "url": url,
            "priceCurrency": "CNY",
            "price": price,
            "itemCondition": "https://schema.org/UsedCondition",
            "availability": "https://schema.org/InStock"
        }
      }

      const script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.textContent = JSON.stringify(structuredDataText);
      document.head.appendChild(script);
}


/**
 * about seller ----------------
 */


async function getBrandProfile(brandId)
{
    const url = "/api/v1/web_mall/brand/{brand_id}/profile".replace("{brand_id}",brandId);
    return axios.get(url);
}



function transformInputNumber(val,min,max){
    return val < min ? "" : val > max ? max : val;
  }

