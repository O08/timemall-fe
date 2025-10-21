import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import { EventFeedScene } from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js";
import { ImageAdaptiveComponent } from '/common/javascripts/compoent/image-adatpive-compoent.js';
import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";
import Pagination from "/common/javascripts/pagination-vue.js";
import { CodeExplainComponent } from "/common/javascripts/compoent/code-explain-compoent.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import { CodeMappingTypeEnum, EnvWebsite } from "/common/javascripts/tm-constant.js";
import { DspReportApi } from "/common/javascripts/dsp-report-api.js";

import { renderDateInChina,renderDateToDayInChina } from "/common/javascripts/util.js";


import { CustomAlertModal } from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const currentDomain = window.location.hostname === 'localhost' ? EnvWebsite.LOCAL : EnvWebsite.PROD;

const RootComponent = {
  data() {
    return {
      reportOptions: [],
      reportForm: this.initReportForm(),
      orderDetail: {},
      productProfile: {},
      modifyingOrderObj: {},
      shippingObj:{
        orderId: "",
        consignee: "",
        shippingAddress: "",
        shippingEmail: ""
      },
      orderList_pagination: {
        url: "/api/v1/app/redeem/buyer/order/list",
        size: 10,
        current: 1,
        total: 0,
        pages: 0,
        records: [],
        paging: {},
        param: {
            q: '',
            status: ''
        },
        responesHandler: (response)=>{
            if(response.code == 200){
                this.orderList_pagination.size = response.order.size;
                this.orderList_pagination.current = response.order.current;
                this.orderList_pagination.total = response.order.total;
                this.orderList_pagination.pages = response.order.pages;
                this.orderList_pagination.records = response.order.records;
                this.orderList_pagination.paging = this.doPaging({current: response.order.current, pages: response.order.pages, size: 5});

            }
        }
      },


    }
  },
  methods: {

    filterOrderListV(){
      this.orderList_pagination.current = 1;
      this.reloadPage(this.orderList_pagination);
    },
    searchOrderListV(){
        this.orderList_pagination.current = 1;
        this.orderList_pagination.param.status="";
        this.reloadPage(this.orderList_pagination);
    },

    showOrderDetailModalV(orderId) {
      findOrderInfo(orderId).then(response=>{
        if(response.data.code == 200){
            
            this.orderDetail=response.data.order;
            $("#orderDetailModal").modal("show");

        }
        if(response.data.code!=200){
            const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
            customAlert.alert(error); 
        }
      });
    },
    showEditShippingInfoModalV(order) {
      this.modifyingOrderObj = JSON.parse(JSON.stringify(order));
      this.shippingObj={
        orderId: order.orderId,
        consignee: order.consignee,
        shippingAddress: order.shippingAddress,
        shippingEmail: order.shippingEmail
      }
      $("#editShippingInfoModal").modal("show");
    },
    validateEditShippingInfoFormAlereadyChangeV(){
      if(this.shippingObj.consignee!=this.modifyingOrderObj.consignee 
         || this.shippingObj.shippingAddress!=this.modifyingOrderObj.shippingAddress
         || this.shippingObj.shippingEmail!=this.modifyingOrderObj.shippingEmail){
         return true;
      }
      return false;
    },
    changeShippingInfoV(){
      changeShippingInfo(this.shippingObj).then(response=>{
        if(response.data.code == 200){
            
          this.reloadPage(this.orderList_pagination);
          $("#editShippingInfoModal").modal("hide");

        }
        if(response.data.code!=200){
            const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
            customAlert.alert(error); 
        }
      });
    },
    showProductInfoModalV(productId) {

      findProductProfile(productId).then(response=>{
        if(response.data.code == 200){
             this.productProfile=response.data.product;
            $("#productInfoModal").modal("show");
        }
        if(response.data.code!=200){
            const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
            customAlert.alert(error); 
        }

      });

    },
    renderDateInChinaV(dateStr){
      return renderDateInChina(dateStr);
    },
    renderDateToDayInChinaV(dateStr){
      return renderDateToDayInChina(dateStr);
    },

    newReportCaseV() {
      newReportCase(this.reportForm).then(response => {
        if (response.data.code == 200) {

          document.querySelector('#caseMaterialFile').value = null;

          $("#reportOasisModal").modal("hide"); // show success modal

        }
        if (response.data.code != 200) {
          customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message);
        }
      })
    },
    showOasisReportModalV(orderId) {

      this.reportForm = this.initReportForm();
      this.reportForm.sceneUrl = this.reportForm.sceneUrl + orderId;

      showOasisReportModal(
        this.loadReportIssueListV
      );
    },
    loadReportIssueListV() {
      loadReportIssueList(this);
    },
    validateReportFormV() {
      return !!this.reportForm.caseDesc && !!this.reportForm.fraudType;
    },
    initReportForm() {

      if (!!document.querySelector('#caseMaterialFile') && !!document.querySelector('#caseMaterialFile').value) {
        document.querySelector('#caseMaterialFile').value = null;
      }
      return {
        fraudType: "",
        scene: "兑换物品订单",
        sceneUrl: currentDomain + "/mall/dsp-report-scene?scene=redeem&order_id=",
        caseDesc: "",
        material: ""
      }
    },
  },
  updated() {

    $(function () {
      $('[data-popper-reference-hidden]').remove();
      $('.popover.custom-popover.bs-popover-auto.fade.show').remove();
      // Enable popovers 
      $('[data-bs-toggle="popover"]').popover();
    });
  }
}


const app = createApp(RootComponent);
app.mixin(new Auth({ need_permission: true }));
app.mixin(new EventFeed({
  need_fetch_event_feed_signal: true,
  need_fetch_mutiple_event_feed: false,
  scene: EventFeedScene.POD
}));
app.mixin(ImageAdaptiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
  return tag.startsWith('content') || tag.startsWith('top')
}
app.mixin(new FriendListCompoent({ need_init: true }));
app.mixin(Pagination);
app.mixin(CodeExplainComponent);
app.mixin(DirectiveComponent);

app.mixin(
  new Ssecompoent({
    sslSetting: {
      need_init: true,
      onMessage: (e) => {
        redeemAppOrder.onMessageHandler(e); //  source: FriendListCompoent
      }
    }
  })
);


const redeemAppOrder = app.mount('#app');

window.redeemAppOrderPage = redeemAppOrder;

redeemAppOrder.pageInit(redeemAppOrder.orderList_pagination);

async function fetchOrderInfo(orderId){
  const url="/api/v1/app/redeem/buyer/order/{id}/info".replace("{id}",orderId);
  return await axios.get(url);
}

async function doModifyOrderShippingInfo(dto){
  const url="/api/v1/app/redeem/admin/order/shipping_info/change";
  return await axios.put(url,dto);
}

async function fetchProductInfo(productId){
  const url="/api/v1/app/redeem/product/{id}/profile".replace("{id}",productId);
  return await axios.get(url);
}

async function findProductProfile(productId){
  return await fetchProductInfo(productId);
}

async function changeShippingInfo(shippingObj){
  return doModifyOrderShippingInfo(shippingObj);
}
async function findOrderInfo(orderId){
  return await fetchOrderInfo(orderId);
}
// report feature


async function newReportCase(reportForm) {

  const materialFile = $('#caseMaterialFile')[0].files[0];

  var form = new FormData();
  if (!!materialFile) {
    form.append("material", materialFile);
  }
  form.append("fraudType", reportForm.fraudType);
  form.append("scene", reportForm.scene);
  form.append("sceneUrl", reportForm.sceneUrl);
  form.append("caseDesc", reportForm.caseDesc);
  return await DspReportApi.addNewReportCase(form);

}
async function loadReportIssueList(appObj) {
  const response = await DspReportApi.fetchCodeList(CodeMappingTypeEnum.REPORTISSUE, "");
  var data = await response.json();
  if (data.code == 200) {

    appObj.reportOptions = data.codes.records;

  }
}

async function showOasisReportModal(loadReportIssueListV) {
  await loadReportIssueListV();
  $("#reportOasisModal").modal("show");
}


$(function () {
  $(".tooltip-nav").tooltip();
});







