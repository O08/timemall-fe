import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js";
import {goLoginPage} from "/common/javascripts/pagenav.js";
import { getQueryVariable,netAge } from "/common/javascripts/util.js";
import { copyValueToClipboard } from "/common/javascripts/share-util.js";
import { uploadCellDataLayerWhenClick,uploadCellDataLayerWhenAppointment,uploadCellDataLayerWhenBuyPlan } from "/common/javascripts/science.js";

import {PriceSbu} from "/common/javascripts/tm-constant.js";
import axios from 'axios';
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";

import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import {EmailNoticeEnum,CellPlanType,CodeMappingTypeEnum,EnvWebsite} from "/common/javascripts/tm-constant.js";
import {getLinkIconUrl,parseLinkUri} from "/common/javascripts/compoent/link-icon-parse.js";
import {Api} from "/common/javascripts/common-api.js";
import {DspReportApi} from "/common/javascripts/dsp-report-api.js";

import  PromotionComponent  from "/mall/javascripts/component/PromotionComponent.js";



import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';


const defaultBrandBannerImage = new URL(
    '/common/images/default-brand-banner-4x3.svg',
    import.meta.url
);
const defaultExperienceImage = new URL(
    '/common/images/default-experience-1x1.svg',
    import.meta.url
);

const currentDomain = window.location.hostname === 'localhost' ? EnvWebsite.LOCAL : EnvWebsite.PROD;
const currentCellId= getQueryVariable("cell_id");
const currentBrandId= getQueryVariable("brand_id");


const defaultCellIntroCoverImage ="https://d13-content.oss-cn-hangzhou.aliyuncs.com/common/image/default-cell-intro-cover.svg";

const RootComponent = {
    data() {
        return {
            reportOptions: [],
            reportForm: this.initReportForm(),

            planExpense: {
                promotionCreditPointDeductionDifference: 0,
                earlyBirdDiscountDifference: 0,
                repurchaseDiscountDifference: 0,
                amount: 0,
                promotionDeduction: 0,
                total: 0
            },
            cellExpense: {
                promotionCreditPointDeductionDifference: 0,
                earlyBirdDiscountDifference: 0,
                repurchaseDiscountDifference: 0,
                amount: 0,
                promotionDeduction: 0,
                total: 0
            },
            error:{},
            defaultExperienceImage,
            defaultBrandBannerImage,
            defaultCellIntroCoverImage,
            profile: {
                content:[],
                dataLoadFinish: false
            },
            selectedSbu: 'day',
            total: 0,
            quantity: "1",
            cellplan: {
                records: []
            },
            displayPlan:{},
            hostingPartner: "",
            focusModal:{
                feed: "",
                confirmHandler:()=>{

                }
            }
        }
    },
    methods: {
        newReportCaseV(){
        newReportCase(this.reportForm).then(response=>{
            if(response.data.code==200){

            document.querySelector('#caseMaterialFile').value = null;

            $("#reportOasisModal").modal("hide"); // show success modal

            }
            if(response.data.code!=200){
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
            }
        })
        },
        showOasisReportModalV(){

            this.reportForm=this.initReportForm();
            

            showOasisReportModal(         
                this.loadReportIssueListV
            );
        },
        loadReportIssueListV(){
            loadReportIssueList(this);
        },
        initReportForm(){

            if(!!document.querySelector('#caseMaterialFile') && !!document.querySelector('#caseMaterialFile').value ){
               document.querySelector('#caseMaterialFile').value = null;
            }

            return {
                fraudType: "",
                scene: "线上商品",
                sceneUrl: currentDomain+"/mall/cell-detail?cell_id=" + currentCellId + "&brand_id="+ currentBrandId,
                caseDesc: "",
                material: ""
            }
        },
        validateReportFormV(){
            return !!this.reportForm.caseDesc && !!this.reportForm.fraudType;
        },
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
            this.focusModal.feed="即将为您下单单品套餐： "+ this.explainCellPlanTypeV(this.displayPlan.planType)+" ,付款金额为：" + this.planExpense.total;
            this.focusModal.confirmHandler=()=>{
                this.orderCellPlanV();
                $("#focusModal").modal("hide"); // show modal

            };
            $("#focusModal").modal("show"); // show modal
        },
        closeOrderCellPlanFocusModalV(){
            $("#focusModal").modal("hide");
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
        fetchBluvarrierV(){
            fetchBluvarrier();
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
            
                    sortSbu();

                    this.$nextTick(() => {
                        this.computeFeeV();
                      })

                    const documentDescriptionTextFormat=convertToPlain(this.profile.productDesc);

                    var description=!documentDescriptionTextFormat ? "" :  documentDescriptionTextFormat.substring(0,Math.min(156,documentDescriptionTextFormat.length));

                    renderPageMetaInfo(this.profile.title,description,this.profile.tags);
                    renderStructuredDataForSEO(this.profile,description);
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
        computeFeeV(){
            computeFee()
        },
        isEmptyObjectV(obj){
            return $.isEmptyObject(obj);
        },
        copyWindowUrlToClipboardV(productTitle){
            const content = "【Bluvarri】 " + window.location.href + " 「 " +productTitle + "」 点击链接直接打开 或者 bluvarri.com 搜索直接打开 ";
            copyValueToClipboard(content);
        }
    },
    watch: {
        'displayPlan.planType': function(newV, oldV){
            if(newV){
                calPlanExpenseObj();
            }
        },
        'userPromotionBenefitLoadFinish': function(newV, oldV){
            if(newV){
                calPlanExpenseObj();
            }
        },
        'brandPromotionDataLoadFinish': function(newV, oldV){
            if(newV){
                calPlanExpenseObj();
            }
        },
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
            brandProfile: {},
            dashboard: {}
        }
    },
    methods: {
       loadBrandInfoV(){
           const brandId= getQueryVariable("brand_id");
            if(!brandId){
                return;
            }
            Api.getBrandProfile(brandId).then(response=>{
                if(response.data.code == 200){
                    this.brandProfile = response.data.profile;
                }
            })
       },
       loadBrandCoreMetricsV(){
            const brandId= getQueryVariable("brand_id");
            if(!brandId){
                return;
            }
            Api.fetchBrandCoreMetrics(brandId).then(response=>{
                if(response.data.code == 200 && response.data.stats){
                    this.dashboard = response.data.stats;
                }
            })
       },
       formatTimeV(date){
            if(!date) return "未知";
            var timespan = (new Date(date)).getTime()/1000;
            return netAge(timespan);
       },
       displayTotalSaleVolumeDataV(_dashboard){
            var totalBuyers=Number(_dashboard.planTotalBuyers) + Number(_dashboard.cellTotalBuyers) + Number(_dashboard.virtualTotalBuyers);
            if(!totalBuyers  || totalBuyers==0){
                return "-";
            }
            return totalBuyers;

       },
       displayRepeatData(data){
           if(!data || data==0){
               return "-";
           }
           return data;
       },
       displayRepeatBuyersRateV(_dashboard){
           var repeatBuyers=Number(_dashboard.planRepeatBuyers) + Number(_dashboard.virtualRepeatBuyers) + Number(_dashboard.cellRepeatBuyers);
           var totalBuyers=Number(_dashboard.planTotalBuyers) + Number(_dashboard.cellTotalBuyers) + Number(_dashboard.virtualTotalBuyers);
           if(!totalBuyers || !repeatBuyers || repeatBuyers==0 || totalBuyers==0){
               return "-";
           }
           var res=100*repeatBuyers/totalBuyers;
           return res.toFixed(2);
       },
    },
    created(){
        this.loadBrandInfoV();
        this.loadBrandCoreMetricsV();
    }
    
}
const app = createApp(RootComponent);
app.mixin(SellerComponent);
app.mixin(new Auth({need_permission : false}));
app.mixin(DirectiveComponent);
app.mixin(ImageAdaptiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('content') || tag.startsWith('sub-nav')
}
app.mixin(PromotionComponent);
const cellDetailPage = app.mount('#app');


window.cellDetail = cellDetailPage;

let customAlert = new CustomAlertModal();

// init load 
cellDetailPage.__initPromotionComponentV();
cellDetailPage.loadCellInfoV();
cellDetailPage.uploadCellDataLayerClicksV();
cellDetailPage.fetchBluvarrierV();
cellDetailPage.fetchCellPlanV();

/**
 * intro -------------
 */
async function getIntroInfoForCell(cellId){
    const url = "/api/v1/web_mall/services/{cell_id}/intro".replace("{cell_id}",cellId);
    return await axios.get(url);
}
async function order(cellId){
    var dto= {
        sbu: cellDetailPage.selectedSbu,
        quantity: cellDetailPage.quantity
    }
    const influencer=getQueryVariable("influencer");
    const chn=getQueryVariable("chn");
    const market=getQueryVariable("market");
    const isValidAffiliateLink=(!!influencer) && (!!chn) && (!!market);
    if(isValidAffiliateLink){
        dto.influencer=influencer;
        dto.chn=chn;
        dto.market=market;
    }
    const url = "/api/v1/mall/services/{cell_id}/order".replace("{cell_id}",cellId);
    return await axios.post(url,dto); 
}

async function doFetchCellPlan(cellId){
    const url="/api/v1/web_mall/services/{cell_id}/plan".replace("{cell_id}",cellId);
    return await axios.get(url);
}
async function doFetchBluvarrier(){
    const url="/api/v1/web_mall/bluvarrier";
    return await axios.get(url);
}
async function fetchBluvarrier(){
    doFetchBluvarrier().then(response=>{
        if(response.data.code==200){
           cellDetailPage.hostingPartner=response.data.bluvarrier.customerId;
        }
    })
}
async function doOrderCellPlan(planId){

    var dto={};
    const influencer=getQueryVariable("influencer");
    const chn=getQueryVariable("chn");
    const market=getQueryVariable("market");
    const isValidAffiliateLink=(!!influencer) && (!!chn) && (!!market);
    if(isValidAffiliateLink){
        dto.influencer=influencer;
        dto.chn=chn;
        dto.market=market;
    }
    const url="/api/v1/mall/services/plan/{id}/order".replace("{id}",planId);
    return await axios.post(url,dto);
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
            Api.sendOrderReceivingEmail(EmailNoticeEnum.CELL_PLAN_ORDER_RECEIVING,response.data.planOrderId);
            // scinece data
            const cellId = getQueryVariable("cell_id");
            uploadCellDataLayerWhenBuyPlan(cellDetailPage.displayPlan.planType,cellId);

            $("#goTopUpModal").modal("show"); 
        }
        if(response.data.code==40024){
            $("#errorModal").modal("show"); 
            cellDetailPage.error=response.data.message + ",不能购买自己的商品和服务。";
            return ;
        }
        if(response.data.code==40007){
            $("#errorModal").modal("show"); 
            cellDetailPage.error=response.data.message + ";不用担心,已为你创建了订单,可前往商城充值,再回到【奇迹工坊】继续付款。";
            return ;
        }
        if(response.data.code!=200){
            $("#errorModal").modal("show"); 
            cellDetailPage.error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
        }

    }).catch(error=>{
        $("#errorModal").modal("show"); 
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
    if(!cellId || !cellDetailPage.quantity 
        || cellDetailPage.cellExpense.total<0 || cellDetailPage.quantity<=0){
            customAlert.alert("请选择需要预约的服务数量与标准付费单元");
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
            Api.sendOrderReceivingEmail(EmailNoticeEnum.CELL_ORDER_RECEIVING,response.data.orderId);
            // reset 
            cellDetailPage.quantity ="1";
            initCellExpense();
            cellDetailPage.__initPromotionComponentV();

            // science data
            uploadCellDataLayerWhenAppointment([cellId]);

            // give option
            customAlert.alert("成功预约，可在【奇迹工坊】查看预约记录");

        }
        if(response.data.code==40024){
            $("#errorModal").modal("show"); 
            cellDetailPage.error=response.data.message + ",不能购买自己的商品和服务。";
            return ;
        }
        if(response.data.code!=200){
            $("#errorModal").modal("show"); 
            cellDetailPage.error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
        }
    })
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
   const selectedFee = getFeeItemBySbu(cellDetailPage.selectedSbu);
   return selectedFee ?  selectedFee.price : 0;
}
function sortSbu(){

  var sortFeeArr=[
        getFeeItemBySbu('minute'),getFeeItemBySbu('hour'),
        getFeeItemBySbu('day'),getFeeItemBySbu('week'),getFeeItemBySbu('month'),
        getFeeItemBySbu('quarter'),
        getFeeItemBySbu('year'),
        getFeeItemBySbu('second')
      ];

    cellDetailPage.profile.fee = sortFeeArr;

}
function getFeeItemBySbu(sbu){
    if($.isEmptyObject(cellDetailPage.profile.fee)){
        cellDetailPage.profile.fee=[]
    }
    const filterFee = cellDetailPage.profile.fee.filter(item=>item.sbu===sbu)[0];
   return filterFee;
}
function computeFee(){
    if(cellDetailPage.selectedSbu === "" || !cellDetailPage.quantity ){
        cellDetailPage.total = 0;
        initCellExpense();
        return ;
    }
    cellDetailPage.cellExpense.amount=getSbuPrice() * cellDetailPage.quantity;
    if((!!cellDetailPage.userPromotionBenefit.creditPoint) &&  cellDetailPage.userPromotionBenefit.creditPoint>0 && cellDetailPage.userPromotionBenefit.creditPoint>= cellDetailPage.cellExpense.amount){
        cellDetailPage.cellExpense.promotionCreditPointDeductionDifference=cellDetailPage.cellExpense.amount;
    }
    if((!!cellDetailPage.userPromotionBenefit.creditPoint) &&  cellDetailPage.userPromotionBenefit.creditPoint>0 && cellDetailPage.userPromotionBenefit.creditPoint< cellDetailPage.cellExpense.amount){
        cellDetailPage.cellExpense.promotionCreditPointDeductionDifference=cellDetailPage.userPromotionBenefit.creditPoint;
    }
    if(cellDetailPage.userPromotionBenefit.canUseRepurchaseCoupon=='1' && cellDetailPage.brandPromotionData.repurchaseDiscountTag=='1'){
        cellDetailPage.cellExpense.repurchaseDiscountDifference=(cellDetailPage.cellExpense.amount*(100-Number(cellDetailPage.brandPromotionData.repurchaseDiscount))/100).toFixed(2);
    }
    if(cellDetailPage.userPromotionBenefit.canUseEarlyBirdCoupon=='1' && cellDetailPage.brandPromotionData.earlyBirdDiscountTag=='1'){
        cellDetailPage.cellExpense.earlyBirdDiscountDifference=(cellDetailPage.cellExpense.amount*(100-Number(cellDetailPage.brandPromotionData.earlyBirdDiscount))/100).toFixed(2);
    }
    var totalPromotionDeduction = (Number(cellDetailPage.cellExpense.promotionCreditPointDeductionDifference) + Number(cellDetailPage.cellExpense.repurchaseDiscountDifference) + Number(cellDetailPage.cellExpense.earlyBirdDiscountDifference)).toFixed(2);
    
    if(totalPromotionDeduction>=cellDetailPage.cellExpense.amount){
        cellDetailPage.cellExpense.promotionDeduction=cellDetailPage.cellExpense.amount;
    }
    if(totalPromotionDeduction<cellDetailPage.cellExpense.amount){
        cellDetailPage.cellExpense.promotionDeduction=totalPromotionDeduction;
    }
    cellDetailPage.cellExpense.total=(Number(cellDetailPage.cellExpense.amount)-Number(cellDetailPage.cellExpense.promotionDeduction)).toFixed(2);

    cellDetailPage.total  = getSbuPrice() * cellDetailPage.quantity;
}

function renderPageMetaInfo(title,description,tags){
    document.title = title + " - 心选商店";
    var keywords= "咘噜咓商品" + ( (!tags || tags.length==0) ? "" : ","+tags.join(","));
    document.getElementsByTagName('meta')["description"].content = description;
    document.getElementsByTagName('meta')["keywords"].content = keywords+","+title;
}

function renderStructuredDataForSEO(product,description){
    var url=window.location.origin + "/mall/cell-detail?cell_id=" + product.id + "&brand_id=" + product.brandId;
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

function initCellExpense(){
    cellDetailPage.cellExpense={
        promotionCreditPointDeductionDifference: 0,
        earlyBirdDiscountDifference: 0,
        repurchaseDiscountDifference: 0,
        amount: 0,
        promotionDeduction: 0,
        total: 0
    }
}

function calPlanExpenseObj(){
    cellDetailPage.planExpense.amount=Number(cellDetailPage.displayPlan.price);

    if((!!cellDetailPage.userPromotionBenefit.creditPoint) &&  cellDetailPage.userPromotionBenefit.creditPoint>0 && cellDetailPage.userPromotionBenefit.creditPoint>= cellDetailPage.displayPlan.price){
        cellDetailPage.planExpense.promotionCreditPointDeductionDifference=cellDetailPage.displayPlan.price;
    }
    if((!!cellDetailPage.userPromotionBenefit.creditPoint) &&  cellDetailPage.userPromotionBenefit.creditPoint>0 && cellDetailPage.userPromotionBenefit.creditPoint< cellDetailPage.displayPlan.price){
        cellDetailPage.planExpense.promotionCreditPointDeductionDifference=cellDetailPage.userPromotionBenefit.creditPoint;
    }
    if(cellDetailPage.userPromotionBenefit.canUseRepurchaseCoupon=='1' && cellDetailPage.brandPromotionData.repurchaseDiscountTag=='1'){
        cellDetailPage.planExpense.repurchaseDiscountDifference=(cellDetailPage.planExpense.amount*(100-Number(cellDetailPage.brandPromotionData.repurchaseDiscount))/100).toFixed(2);
    }
    if(cellDetailPage.userPromotionBenefit.canUseEarlyBirdCoupon=='1' && cellDetailPage.brandPromotionData.earlyBirdDiscountTag=='1'){
        cellDetailPage.planExpense.earlyBirdDiscountDifference=(cellDetailPage.planExpense.amount*(100-Number(cellDetailPage.brandPromotionData.earlyBirdDiscount))/100).toFixed(2);
    }
    var totalPromotionDeduction = (Number(cellDetailPage.planExpense.promotionCreditPointDeductionDifference) + Number(cellDetailPage.planExpense.repurchaseDiscountDifference) + Number(cellDetailPage.planExpense.earlyBirdDiscountDifference)).toFixed(2);
    
    if(totalPromotionDeduction>=cellDetailPage.planExpense.amount){
        cellDetailPage.planExpense.promotionDeduction=cellDetailPage.planExpense.amount;
    }
    if(totalPromotionDeduction<cellDetailPage.planExpense.amount){
        cellDetailPage.planExpense.promotionDeduction=totalPromotionDeduction;
    }
    cellDetailPage.planExpense.total=(Number(cellDetailPage.planExpense.amount)- Number(cellDetailPage.planExpense.promotionDeduction)).toFixed(2);
}


function transformInputNumber(val,min,max){
    return val < min ? "" : val > max ? max : val;
  }

  $(function(){
	$(".tooltip-nav").tooltip();
});

// report feature


  async function newReportCase(reportForm){
  
    const materialFile =  $('#caseMaterialFile')[0].files[0];
  
    var form = new FormData();
    if(!!materialFile){
      form.append("material",materialFile);
    }
    form.append("fraudType",reportForm.fraudType);
    form.append("scene",reportForm.scene);
    form.append("sceneUrl",reportForm.sceneUrl);
    form.append("caseDesc",reportForm.caseDesc);
    return await DspReportApi.addNewReportCase(form);
  
  }
  async function loadReportIssueList(appObj){
    const response = await DspReportApi.fetchCodeList(CodeMappingTypeEnum.REPORTISSUE,"");
    var data = await response.json();
    if(data.code==200){
       
       appObj.reportOptions=data.codes.records;
  
    }
  }
  
  async function showOasisReportModal(loadReportIssueListV){
      await loadReportIssueListV();
      $("#reportOasisModal").modal("show");
  }

  function convertToPlain(html){

    // Create a new div element
    var tempDivElement = document.createElement("div");
    
    // Set the HTML content with the given value
    tempDivElement.innerHTML = html;
    
    // Retrieve the text property of the element 
    return (tempDivElement.textContent || tempDivElement.innerText || "");
  }