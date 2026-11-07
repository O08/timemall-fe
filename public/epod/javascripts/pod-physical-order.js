import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import {EventFeedScene, RefundSceneEnum, PhysicalOrderStatusEnum, PhysicalOrderPaymentStatusEnum, PhysicalOrderShippingStatusEnum, PhysicalOrderItemStatusEnum} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";
import Pagination  from "/common/javascripts/pagination-vue.js";
import {CodeExplainComponent} from "/common/javascripts/compoent/code-explain-compoent.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import {CodeMappingTypeEnum,EnvWebsite} from "/common/javascripts/tm-constant.js";
import {DspReportApi} from "/common/javascripts/dsp-report-api.js";

import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
import {copyValueToClipboard} from "/common/javascripts/share-util.js";
let customAlert = new CustomAlertModal();


const REQUEST_FAIL_TIP = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：";

// 买家侧状态分组，对应设计稿「全部/待付款/待发货/待收货/已完成/退款售后」
// 已关闭、已取消暂不计入
const ORDER_STATUS_TABS = [
  {name: "全部", status: ""},
  {name: "待付款", status: PhysicalOrderStatusEnum.PENDING_PAYMENT},
  {name: "待发货", status: PhysicalOrderStatusEnum.PAID},
  {name: "待收货", status: PhysicalOrderStatusEnum.SHIPPED},
  {name: "已完成", status: PhysicalOrderStatusEnum.COMPLETED},
  {name: "退款售后", status: PhysicalOrderStatusEnum.REFUNDED},
  {name: "已取消", status: PhysicalOrderStatusEnum.CANCELLED}

];


const currentDomain = window.location.hostname === 'localhost' ? EnvWebsite.LOCAL : EnvWebsite.PROD;

const RootComponent = {
  data() {
    return {
      error:{},
      applyRefundObj: emptyApplyRefundForm(),
      reportOptions: [],
      reportForm: this.initReportForm(),
      orderStatusTabs: ORDER_STATUS_TABS,
      orderDetail: {orderId: "", orderStatus: "", items: []},
      deliveryInfoObj: {orderId: ""},
      productProfile: {},
      repayFocusModal:{
          feed: "",
          confirmHandler:()=>{

          }
      },
      physicalOrder_pagination: {
        url: "/api/v1/web_pod/physical_order/query",
        size: 10,
        current: 1,
        total: 0,
        pages: 0,
        records: [],
        paging: {},
        param: {
          q: '',
          status: ""
        },
        responesHandler: (response)=>{
            if(response.code == 200){
                this.physicalOrder_pagination.size = response.order.size;
                this.physicalOrder_pagination.current = response.order.current;
                this.physicalOrder_pagination.total = response.order.total;
                this.physicalOrder_pagination.pages = response.order.pages;
                this.physicalOrder_pagination.records = response.order.records;
                this.physicalOrder_pagination.paging = this.doPaging({current: response.order.current, pages: response.order.pages, size: 5});

            }
        }
      },
    }},
    methods: {
      isActiveStatusTabV(tab){
        return this.physicalOrder_pagination.param.status==tab.status;
      },
      chooseStatusTabV(tab){
        this.physicalOrder_pagination.param.status = tab.status;
        this.retrieveByStatusV();
      },
      orderStatusClassV(order){
        switch(order.orderStatus){
          case PhysicalOrderStatusEnum.PENDING_PAYMENT:
            return "po-status-pay";
          case PhysicalOrderStatusEnum.PAID:
            return "po-status-ship";
          case PhysicalOrderStatusEnum.SHIPPED:
            return "po-status-receive";
          case PhysicalOrderStatusEnum.COMPLETED:
            return "po-status-done";
          default:
            return "po-status-refund";
        }
      },
      paymentStatusClassV(order){
        switch(order.paymentStatus){
          case PhysicalOrderPaymentStatusEnum.PARTIAL_REFUNDED:
          case PhysicalOrderPaymentStatusEnum.FULLY_REFUNDED:
          case PhysicalOrderPaymentStatusEnum.CANCELLED:
          case PhysicalOrderPaymentStatusEnum.CLOSED:
            return "fund-refunded";
          case PhysicalOrderPaymentStatusEnum.ALREADY_REMITTANCE:
            return "fund-settled";
          case PhysicalOrderPaymentStatusEnum.PAID:
            return "fund-escrow";
          default:
            return "fund-pending";
        }
      },
      isMultiItemOrderV(order){
        return order.items.length>1;
      },
      itemStatusClassV(item){
        switch(item.status){
          case PhysicalOrderItemStatusEnum.REFUNDED:
          case PhysicalOrderItemStatusEnum.CANCELLED:
          case PhysicalOrderItemStatusEnum.CLOSED:
            return "fund-refunded";
          case PhysicalOrderItemStatusEnum.SETTLED:
            return "fund-settled";
          case PhysicalOrderItemStatusEnum.PAID:
            return "fund-escrow";
          default:
            return "fund-pending";
        }
      },
      lineStatusV(item){
        switch(item.status){
          case PhysicalOrderItemStatusEnum.REFUNDED:
          // case PhysicalOrderItemStatusEnum.CANCELLED:
          // case PhysicalOrderItemStatusEnum.CLOSED:
            return this.explainPhysicalOrderItemStatusV(item.status);
          default:
            return "";
        }
      },
      canShowLineStatusV(order){
        return order.orderStatus==PhysicalOrderStatusEnum.SHIPPED
        || order.orderStatus==PhysicalOrderStatusEnum.COMPLETED;
      },
      orderTotalFeeTextV(order){
        return this.feeTextV(Number(order.payAmount));
      },
      itemFeeTextV(item){
        return this.feeTextV(Number(item.splitPayAmount));
      },
      // 商品总额＝Σ(单价×数量)，优惠＝Σ行分摊优惠，与行实付（分账金额）口径分开（同商家端「金额明细」）
      orderGoodsTotalV(detail){
        return detail.items
          .reduce((total, item)=> total + Number(item.productPrice) * Number(item.quantity), 0)
          .toFixed(2);
      },
      orderPromotionTotalV(detail){
        return detail.items
          .reduce((total, item)=> total + Number(item.splitPromotionAmount), 0)
          .toFixed(2);
      },
      itemPromotionTextV(item){
        const promotion = Number(item.splitPromotionAmount);
        if(!Number.isFinite(promotion) || promotion<=0){
          return "";
        }
        return "已优惠 ¥" + promotion.toFixed(2);
      },
      feeTextV(amount){
        return Number.isFinite(amount)&&amount>0 ? "¥" + amount.toFixed(2) : "--";
      },
      orderItemCountV(order){
        return order.items.reduce((count, item)=>{
          const quantity = Number(item.quantity);
          return count + (Number.isFinite(quantity)&&quantity>0 ? quantity : 1);
        }, 0);
      },
      hasDeliveredV(detail){
        return detail.shippingStatus==PhysicalOrderShippingStatusEnum.SHIPPED
            || detail.shippingStatus==PhysicalOrderShippingStatusEnum.DELIVERED;
      },
      displayTextInfoOrBlankDashV(info){
        return info || "--";
      },
      fullAddressTextV(detail){
        return [detail.recipient, detail.recipientPhone, detail.shippingAddress]
          .filter(item => !!item)
          .join(" ");
      },
      deliveryStatusV(detail){
        switch(detail.shippingStatus){
          case PhysicalOrderShippingStatusEnum.SHIPPED:
            return "配送中";
          case PhysicalOrderShippingStatusEnum.DELIVERED:
            return "已送达";
          default:
            return "待发货";
        }
      },
      deliveryStatusClassV(detail){
        switch(detail.shippingStatus){
          case PhysicalOrderShippingStatusEnum.SHIPPED:
            return "delivery-status-shipping";
          case PhysicalOrderShippingStatusEnum.DELIVERED:
            return "delivery-status-delivered";
          default:
            return "delivery-status-pending";
        }
      },
      deliveryProgressV(order){
        if(order.orderStatus==PhysicalOrderStatusEnum.SHIPPED){
          return "商家已发货，商品正在配送中";
        }
        if(order.orderStatus==PhysicalOrderStatusEnum.COMPLETED){
          return "商品已送达，订单已完成";
        }
        return "";
      },
      copyValueToClipboardV(content){
        if(!content){
          return;
        }
        copyValueToClipboard(content);
      },
      canRepayOrderV(order){
        return order.orderStatus==PhysicalOrderStatusEnum.PENDING_PAYMENT;
      },
      canApplyRefundV(order){
        // 款项还在平台托管中（待发货）才可申请全额退款
        return order.orderStatus==PhysicalOrderStatusEnum.PAID;
      },
      canViewDeliveryV(order){
        return order.orderStatus==PhysicalOrderStatusEnum.SHIPPED
            || order.orderStatus==PhysicalOrderStatusEnum.COMPLETED;
      },
      // 列表行只有商品与整单状态，资金/配送/金额明细都靠详情接口补齐，取回后再开弹窗避免闪一屏 --
      showOrderDetailModalV(order){
        this.orderDetail = {orderId: order.orderId, orderStatus: "", items: []};
        handleOrderFetch(fetchOrderDetail(order.orderId), "detail", (detail)=>{
          this.orderDetail = detail;
          $("#orderDetailModal").modal("show"); // show modal
        });
      },
      showProductInfoModalV(productId){
        this.productProfile = {};
        $("#orderDetailModal").modal("hide"); // show modal
        $("#productInfoModal").modal("show"); // show modal
        this.fetchProductProfileV(productId);
      },
      fetchProductProfileV(productId){
        fetchProductProfile(productId).then(response=>{
          if(response.data.code==200 && !!response.data.profile){
            this.productProfile = response.data.profile;
          }
        });
      },
      productStatusClassV(profile){
        return profile.status=='3' ? "pi-status-off" : "pi-status-on";
      },
      showDeliveryInfoModalV(order){
        this.deliveryInfoObj = {orderId: order.orderId};
        handleOrderFetch(fetchOrderDeliveryInfo(order.orderId), "delivery", (delivery)=>{
          this.deliveryInfoObj = delivery;
          $("#deliveryInfoModal").modal("show"); // show modal
        });
      },
      closRePayFocusModalV(){
        $("#repayFocusModal").modal("hide"); // show modal
      },
      showRePayFocusModalV(order){
        this.repayFocusModal.feed="即将扣款： " + this.orderTotalFeeTextV(order) + "，支付成功后，您的款项将由平台托管，在7天内可以通过【取消订单】或【举报投诉】通道发起退款"
        this.repayFocusModal.confirmHandler=()=>{
            this.repayV(order);
            $("#repayFocusModal").modal("hide"); // show modal

        };
        $("#repayFocusModal").modal("show"); // show modal
      },
      repayV(order){
        repayOrder(order.orderId).then(response=>{
          if(response.data.code==200){
             this.reloadPage(this.physicalOrder_pagination);// refresh table

              customAlert.alert("付款成功！");
          }
          if(response.data.code==40007){
              $("#errorModal").modal("show"); 
              this.error=response.data.message + ",请前往商城充值。";
              return ;
          }
          if(response.data.code!=200){
              $("#errorModal").modal("show"); 
              this.error=REQUEST_FAIL_TIP+response.data.message;
          }

        }).catch(error=>{
            this.error=REQUEST_FAIL_TIP+error;
        });
      },
      closErrorModalV(){
        $("#errorModal").modal("hide"); 
      },
      showApplyRefundModalV(order){
        this.applyRefundObj = {
          ...emptyApplyRefundForm(),
          orderId: order.orderId,
          payAmount: order.payAmount,
          items: order.items
        };
        $("#applyRefundModal").modal("show"); 
      },
      applyRefundV(){
        const refund = this.applyRefundObj;
        applyRefund({
          scene: RefundSceneEnum.PHYSICAL_ORDER,
          param: JSON.stringify({orderId: refund.orderId, refundReason: refund.refundReason})
        }).then(response=>{
          if(response.data.code==200){
            $("#applyRefundModal").modal("hide"); // close modal

            this.reloadPage(this.physicalOrder_pagination);// refresh table
            customAlert.alert("退款成功");
          }
          if(response.data.code!=200){
            customAlert.alert(REQUEST_FAIL_TIP+response.data.message);
          }
        }).catch(error=>{
          customAlert.alert(REQUEST_FAIL_TIP+error);
        });
      },
      retrieveOrderDataV(){
        retrieveOrderData();
      },
      retrieveByStatusV(){
        this.physicalOrder_pagination.current = 1;
        this.physicalOrder_pagination.size = 10;
        this.reloadPage(this.physicalOrder_pagination);
      },
      newReportCaseV(){
        newReportCase(this.reportForm).then(response=>{
            if(response.data.code==200){

              customAlert.alert("举报/投诉记录已追加到档案库，可通过【个人中心】-【争端解决】了解最新的处理情况");
              
              document.querySelector('#caseMaterialFile').value = null;

              $("#reportOasisModal").modal("hide"); 

            }
            if(response.data.code!=200){
                customAlert.alert(REQUEST_FAIL_TIP+response.data.message);
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
            scene: "实物商品订单",
            sceneUrl: currentDomain+"/mall/dsp-report-scene?scene=physical_order&order_id=",
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
                physicalOrderPage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);
const physicalOrderPage = app.mount('#app');
window.cPhysicalOrderPage = physicalOrderPage;

physicalOrderPage.pageInit(physicalOrderPage.physicalOrder_pagination);




function retrieveOrderData(){
  const tmp = physicalOrderPage.physicalOrder_pagination.param.q;
  initQueryParam();
  physicalOrderPage.physicalOrder_pagination.param.q = tmp;

  physicalOrderPage.reloadPage(physicalOrderPage.physicalOrder_pagination);

}


function initQueryParam(){
  physicalOrderPage.physicalOrder_pagination.param = {
    q: '',
    status: ""
  }
  physicalOrderPage.physicalOrder_pagination.current = 1;
  physicalOrderPage.physicalOrder_pagination.size = 10;
}


async function fetchOrderDetail(orderId){
  const url = "/api/v1/web_pod/physical_order/{order_id}/detail".replace("{order_id}",orderId);
  return await axios.get(url);
}
async function fetchOrderDeliveryInfo(orderId){
  const url = "/api/v1/web_estudio/physical_order/{order_id}/delivery_info".replace("{order_id}",orderId);
  return await axios.get(url);
}
function handleOrderFetch(promise, key, render){
  promise.then(response=>{
    const data = response.data;
    if(data.code!=200){
      customAlert.alert(REQUEST_FAIL_TIP + data.message);
      return;
    }
    if(!data[key]){
      customAlert.alert(REQUEST_FAIL_TIP + "接口未返回订单数据");
      return;
    }
    render(data[key]);
  }).catch(error=>{
    customAlert.alert(REQUEST_FAIL_TIP + error);
  });
}


async function doFetchProductProfile(productId){
  const url = "/api/v1/web_mall/physical_product/{id}/info".replace("{id}",productId);
  return await axios.get(url);
}
async function fetchProductProfile(productId){
  return await doFetchProductProfile(productId);
}


async function doApplyRefund(dto){
  const url = "/api/v1/web_epod/refund";
  return await axios.post(url, dto);
}

async function repayOrder(orderId){
  const url = "/api/v1/mall/physical_order/{order_id}/repay".replace("{order_id}",orderId);
  return await axios.post(url,{});
}
async function applyRefund(applyRefundObj){
 
 return await doApplyRefund(applyRefundObj);

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

// 取消订单·全额退款弹窗的初始态：每次打开整体重置，避免上一单残留
function emptyApplyRefundForm(){
  return {
    orderId: "",
    payAmount: "",
    items: [],
    refundReason: ""
  };
}

