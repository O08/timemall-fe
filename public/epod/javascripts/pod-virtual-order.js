import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import {EventFeedScene} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";
import Pagination  from "/common/javascripts/pagination-vue.js";
import {CodeExplainComponent} from "/common/javascripts/compoent/code-explain-compoent.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import {CodeMappingTypeEnum,EnvWebsite} from "/common/javascripts/tm-constant.js";
import {DspReportApi} from "/common/javascripts/dsp-report-api.js";
import { uploadVirtualProductDataLayerWhenBuy} from "/common/javascripts/science.js";

import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();


const currentDomain = window.location.hostname === 'localhost' ? EnvWebsite.LOCAL : EnvWebsite.PROD;



const RootComponent = {
  data() {
    return {
      error:{},
      applyRefundObj: {
        orderId: "",
        refundReason: ""
      },
      reportOptions: [],
      reportForm: this.initReportForm(),
      deliverMaterial: {},
      repayFocusModal:{
          feed: "",
          confirmHandler:()=>{

          }
      },
      virtualOrder_pagination: {
        url: "/api/v1/web_pod/virtual/order/list",
        size: 10,
        current: 1,
        total: 0,
        pages: 0,
        records: [],
        paging: {},
        param: {
          q: '',
          tag: ""
        },
        responesHandler: (response)=>{
            if(response.code == 200){
                this.virtualOrder_pagination.size = response.order.size;
                this.virtualOrder_pagination.current = response.order.current;
                this.virtualOrder_pagination.total = response.order.total;
                this.virtualOrder_pagination.pages = response.order.pages;
                this.virtualOrder_pagination.records = response.order.records;
                this.virtualOrder_pagination.paging = this.doPaging({current: response.order.current, pages: response.order.pages, size: 5});

            }
        }
      },
    }},
    methods: {
      getMoneyStatusV(order){
        if(order.alreadyRefund=='1'){
          return "已退回款项";
        }
        if(order.alreadyRemittance=='1'){
          return "已汇款给商家";
        }
        if(order.alreadyPay=='1'){
          return "平台托管中";
        }
        return "";

      },
      closRePayFocusModalV(){
        $("#repayFocusModal").modal("hide"); // show modal
      },
      showRePayFocusModalV(order){
        this.repayFocusModal.feed="支付成功后，您的资金将转存到bluvarri.com, 在7天内可以通过【申请退款】或【举报投诉】通道请求退款"
        this.repayFocusModal.confirmHandler=()=>{
            this.repayV(order);
            $("#repayFocusModal").modal("hide"); // show modal

        };
        $("#repayFocusModal").modal("show"); // show modal
      },
      repayV(order){
        repay(order.orderId).then(response=>{
          if(response.data.code==200){
             // scinece data
             uploadVirtualProductDataLayerWhenBuy(order.productId);
             this.reloadPage(this.virtualOrder_pagination);// refresh table

              customAlert.alert("付款成功！");
          }
          if(response.data.code==40007){
              $("#errorModal").modal("show"); 
              this.error=response.data.message + ",可前往商城充值。";
              return ;
          }
          if(response.data.code!=200){
              $("#errorModal").modal("show"); 
              this.error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
          }

        }).catch(error=>{
            this.error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error;
        });
      },
      showApplyRefundModalV(orderId){
        this.applyRefundObj = {
          orderId: orderId,
          refundReason: ""
        }
        $("#applyRefundModal").modal("show"); 
      },
      applyRefundV(){
        applyRefund(this.applyRefundObj).then(response=>{
          if(response.data.code==200){

            this.reloadPage(this.virtualOrder_pagination);// refresh table
            $("#applyRefundModal").modal("hide"); // close modal

          }
          if(response.data.code!=200){
            customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
          }
        })
      },
      retrieveOrderDataV(){
        retrieveOrderData();
      },
      retrieveByStatusV(){
        this.virtualOrder_pagination.current = 1;
        this.virtualOrder_pagination.size = 10;
        this.reloadPage(this.virtualOrder_pagination);
      },
      showViewDeliverMaterialModalV(orderId){
        this.deliverMaterial = {};
        fetchDeliverMaterial(orderId).then(response=>{
            if(response.data.code==200){

                this.deliverMaterial = response.data.deliver;
                $("#deliverMaterialViewModal").modal("show"); // show modal

            }
            if(response.data.code!=200){
              this.deliverMaterial.error = response.data.message;
              $("#deliverMaterialViewModal").modal("show"); // show modal
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
      showOasisReportModalV(orderId){

          this.reportForm=this.initReportForm();
          this.reportForm.sceneUrl = this.reportForm.sceneUrl+orderId;

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
            scene: "虚拟商品订单",
            sceneUrl: currentDomain+"/mall/dsp-report-scene?scene=virtual_order&order_id=",
            caseDesc: "",
            material: ""
        }
      },
    },
    updated(){
        
        $(function() {
            $('[data-popper-reference-hidden]').remove();
            $('.popover.custom-popover.bs-popover-auto.fade.show').remove();
            // Enable popovers 
            $('[data-bs-toggle="popover"]').popover();
        });
    }
}

const app = createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : false,
    scene: EventFeedScene.POD}));
app.mixin(ImageAdaptiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('content')
}
app.mixin(new FriendListCompoent({need_init: true}));
app.mixin(Pagination);
app.mixin(CodeExplainComponent);
app.mixin(DirectiveComponent);

app.mixin(
    new Ssecompoent({
        sslSetting:{
            need_init: true,
            onMessage: (e)=>{
                virtualOrderPage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);
const virtualOrderPage = app.mount('#app');
window.cVirtualOrder = virtualOrderPage;

virtualOrderPage.pageInit(virtualOrderPage.virtualOrder_pagination);




function retrieveOrderData(){
  const tmp = virtualOrderPage.virtualOrder_pagination.param.q;
  initQueryParam();
  virtualOrderPage.virtualOrder_pagination.param.q = tmp;

  virtualOrderPage.reloadPage(virtualOrderPage.virtualOrder_pagination);

}


function initQueryParam(){
  virtualOrderPage.virtualOrder_pagination.param = {
    q: '',
    tag: ""
  }
  virtualOrderPage.virtualOrder_pagination.current = 1;
  virtualOrderPage.virtualOrder_pagination.size = 10;
}


async function doFetchDeliverMaterial(orderId){

  const url ="/api/v1/web_pod/virtual/order/{id}/deliver".replace("{id}",orderId);
  return await axios.get(url);

}

async function doApplyRefund(dto){

  const url = "/api/v1/web_pod/virtual/order/apply_refund";
  return await axios.put(url,dto);

}

async function doRepay(orderId){
  const url = "/api/v1/mall/virtual/order/{id}/repay".replace("{id}",orderId);
  return await axios.post(url,{});
}
function repay(orderId){
   if(!orderId){
       return;
   }
   return doRepay(orderId);
}

async function applyRefund(applyRefundObj){
 
 return await doApplyRefund(applyRefundObj);

}

async function fetchDeliverMaterial(orderId){

  return await doFetchDeliverMaterial(orderId);
 
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


$(function(){
	$(".tooltip-nav").tooltip();
});