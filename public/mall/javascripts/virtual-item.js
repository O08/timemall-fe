import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import {goLoginPage} from "/common/javascripts/pagenav.js";

import Auth from "/estudio/javascripts/auth.js"
import { getQueryVariable,formatCmpctNumber } from "/common/javascripts/util.js";
import axios from 'axios';
import {Api} from "/common/javascripts/common-api.js";
import {DspReportApi} from "/common/javascripts/dsp-report-api.js";

import { copyValueToClipboard } from "/common/javascripts/share-util.js";

import defaultCellPreviewImage from '/common/images/default-cell-preview.jpg';
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 

import {getLinkIconUrl,parseLinkUri} from "/common/javascripts/compoent/link-icon-parse.js";
import { uploadVirtualProductDataLayerWhenBuy ,uploadVirtualProductDataLayerWhenClick} from "/common/javascripts/science.js";


import {CodeMappingTypeEnum,EnvWebsite} from "/common/javascripts/tm-constant.js";
import { transformInputNumberAsPositive } from "/common/javascripts/util.js";


import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const currentProductId= window.location.pathname.split('/').pop();
const currentBrandId = brandId= getQueryVariable("brand_id");
const currentDomain = window.location.hostname === 'localhost' ? EnvWebsite.LOCAL : EnvWebsite.PROD;

const RootComponent = {
    data() {
        return {
          productId: currentProductId,
          brandId: currentBrandId,
          reportOptions: [],
          reportForm: this.initReportForm(),
          bill: {
            quantity: 1,
            price: 0.00
          },
          sellerProducts: [],
          brandProfile: {
            skills: [],
            links: []
          },
          profile: {
            showcase:[]
          },
          error:{},
          defaultCellPreviewImage,
          focusModal:{
              feed: "",
              confirmHandler:()=>{

              }
          }
        }
    },
    methods: {
      isAutoShippingV(shippingMethod){
        return "standard"===shippingMethod || "random"===shippingMethod;
      },
      uploadVirtualProductDataLayerClicksV(){
        if(!!currentProductId){
          uploadVirtualProductDataLayerWhenClick([currentProductId]);
        }
      },
      orderNowV(){
        orderNow(this.productId,this.bill);
      },
      showOrderVirtualProductFocusModalV(){

        if(!this.bill.quantity){
          customAlert.alert("请输入需要购买的商品数量");
          return
        }
        this.focusModal.feed="即将为您下单虚拟商品： "+ this.profile.productName +" ,付款金额为：" + (this.bill.quantity * this.bill.price).toFixed(2);
        this.focusModal.confirmHandler=()=>{
            this.orderNowV();
            $("#focusModal").modal("hide"); // show modal
        };
        $("#focusModal").modal("show"); // show modal
      },
      closeOrderVirtualProductFocusModalV(){
          $("#focusModal").modal("hide");
      },
      getLinkIconUrlV(url){
        return getLinkIconUrl(url);
      },
      formatCmpctNumberV(number){
        return formatCmpctNumber(Number(number));
      },
      transformInputNumberAsPositiveV(e){
        return transformInputNumberAsPositive(e);
      },
      parseLinkUriV(uri){
        return parseLinkUri(uri);
      },
      getProductsFromBrandV(){
        if(!this.brandId){
          return;
        }
        getProductsFromBrand(this.brandId).then(response=>{
          if(response.data.code == 200){
             this.sellerProducts = response.data.product.records;
          }
        })
      },
      copyWindowUrlToClipboardV(){
          const content = "【班蔚】 " + this.reportForm.sceneUrl + " 「 " + this.profile.productName + "」 点击链接直接打开 或者 bluvarri.com 搜索直接打开 ";
          copyValueToClipboard(content);
      },
      loadBrandInfoV(){
        if(!this.brandId){
            return;
        }
        Api.getBrandProfile(this.brandId).then(response=>{
            if(response.data.code == 200){
                this.brandProfile = response.data.profile;
            }
        })
      },
      getProductInfoV(){
        getProductInfo(this.productId).then(response=>{
          if(response.data.code==200){
             this.profile = response.data.profile;
             if(!this.profile.showcase){
              this.profile.showcase=[];
             }


             this.bill.price =  this.profile.productPrice ;
             const documentTitle = !this.profile.productName ? "商品详情": this.profile.productName;

             const documentDescriptionTextFormat=convertToPlain(this.profile.productDesc);

             const documentDescription= !documentDescriptionTextFormat ? "" :  documentDescriptionTextFormat.substring(0,Math.min(156,documentDescriptionTextFormat.length));
             renderPageMetaInfo(documentTitle,documentDescription,this.profile.tags);
          }
        })
      },
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
      validateReportFormV(){
        return !!this.reportForm.caseDesc && !!this.reportForm.fraudType;
      },
      initReportForm(){

        if(!!document.querySelector('#caseMaterialFile') && !!document.querySelector('#caseMaterialFile').value ){
           document.querySelector('#caseMaterialFile').value = null;
        }

        return {
            fraudType: "",
            scene: "虚拟商品",
            sceneUrl: currentDomain+"/mall/virtual/" + currentProductId + "?brand_id="+ currentBrandId,
            caseDesc: "",
            material: ""
        }
      },
    }

}

const app = createApp(RootComponent);
app.mixin(new Auth({need_permission : false}));
app.mixin(DirectiveComponent);
app.mixin(ImageAdaptiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('content')
}

// app.component("infinite-loading", InfiniteLoading);
const virtualProduct = app.mount('#app');
window.virtualProductPage = virtualProduct;

virtualProduct.loadBrandInfoV();
virtualProduct.getProductInfoV();
virtualProduct.getProductsFromBrandV();
virtualProduct.uploadVirtualProductDataLayerClicksV();

async function fetchProduct(productId){
  const url = "/api/v1/web_mall/virtual/product/{id}/profile".replace("{id}",productId);
  return await axios.get(url);
}
async function fetchProductsFromBrand(brandId){
  const url = "/api/v1/web_mall/brand/virtual/product?brandId="+brandId+"&status=2&current=1&size=4";
  return await axios.get(url);
}
async function order(dto){
  const url = "/api/v1/mall/virtual/order";
  return await axios.post(url,dto); 
}

async function getProductsFromBrand(brandId){
  return await fetchProductsFromBrand(brandId);
}
async function getProductInfo(productId){
  return await fetchProduct(productId);
}


function renderPageMetaInfo(title,description,tags){
  document.title = title + " - 虚拟商品";
  var keywords= "虚拟商品" + ( (!tags || tags.length==0) ? "" : ","+tags.join(","));
  document.getElementsByTagName('meta')["description"].content = description;
  document.getElementsByTagName('meta')["keywords"].content = keywords+","+title;
}

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



function orderNow(productId,bill){

  if(!productId){
    return
  }

  // 用户未登录，跳到登录页面
  if(!virtualProduct.user_already_login){
      goLoginPage();
      return
  }
  virtualProduct.error={};

  const dto={
    productId: productId,
    quantity: bill.quantity
  }

  order(dto).then(response=>{
    if(response.data.code==200){
        // scinece data
        uploadVirtualProductDataLayerWhenBuy(productId);

        $("#goTopUpModal").modal("show"); 
    }
    if(response.data.code==40024){
        $("#errorModal").modal("show"); 
        virtualProduct.error=response.data.message + ",不能购买自己的商品和服务。";
        return ;
    }
    if(response.data.code==40007){
        $("#errorModal").modal("show"); 
        virtualProduct.error=response.data.message + ";不用担心,已为你创建了订单,可前往商城充值,再回到【奇迹工坊】继续付款。";
        return ;
    }
    if(response.data.code!=200){
        $("#errorModal").modal("show"); 
        virtualProduct.error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
    }

  }).catch(error=>{
      $("#errorModal").modal("show"); 
      virtualProduct.error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error;
  });

}

function convertToPlain(html){

  // Create a new div element
  var tempDivElement = document.createElement("div");
  
  // Set the HTML content with the given value
  tempDivElement.innerHTML = html;
  
  // Retrieve the text property of the element 
  return (tempDivElement.textContent || tempDivElement.innerText || "");
}

$(function(){
	$(".tooltip-nav").tooltip();
});