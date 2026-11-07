import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import Pagination  from "/common/javascripts/pagination-vue.js";
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'
import Auth from "/estudio/javascripts/auth.js"

import {EventFeedScene, RefundSceneEnum, PhysicalOrderStatusEnum, PhysicalOrderPaymentStatusEnum, PhysicalOrderShippingStatusEnum, PhysicalOrderItemStatusEnum} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js';
import {CodeExplainComponent} from "/common/javascripts/compoent/code-explain-compoent.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";
import {validateEmailOrPhoneInput} from "/common/javascripts/util.js";
import {copyValueToClipboard} from "/common/javascripts/share-util.js";


import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();


const SELF_DELIVERY_COMPANY = "自主配送";

const REFUND_AUTH_TERM = "我支持退款";

const REQUEST_FAIL_TIP = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：";


const RootComponent = {
    data() {
        return {
            orderDetail: {
                items: []
            },
            deliveryInfoObj: {},
            deliverOrderObj: emptyDeliverForm(""),
            subOrderRefundObj: emptyRefundForm(),
            physicalOrderList_pagination:{
                url: "/api/v1/web_estudio/physical_order/query",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                    q: "",
                    status: ""
                },
                paging: {},
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.physicalOrderList_pagination.size = response.order.size;
                        this.physicalOrderList_pagination.current = response.order.current;
                        this.physicalOrderList_pagination.total = response.order.total;
                        this.physicalOrderList_pagination.pages = response.order.pages;
                        this.physicalOrderList_pagination.records = response.order.records;
                        this.physicalOrderList_pagination.paging = this.doPaging({current: response.order.current, pages: response.order.pages, size: 5});
                    }
                }
            }
        }

    },
    methods: {
        showOrderDetailModalV(order){
          this.orderDetail = { orderId: order.orderId, items: [] };
          handleFetch(fetchOrderDetail(order.orderId), (data)=>{
            this.orderDetail = data.detail;
            $("#orderDetailModal").modal("show"); 
          });
        },
        reloadOrderDetailV(){
          handleFetch(fetchOrderDetail(this.orderDetail.orderId), (data)=>{
            this.orderDetail = data.detail;
          });
        },
        orderGoodsTotalV(detail){
          // 商品总额＝Σ(单价×数量)，与行实付（分账金额）区分：优惠前口径
          return detail.items
            .reduce((total, line) => total + Number(line.productPrice) * Number(line.quantity), 0)
            .toFixed(2);
        },
        orderPromotionTotalV(detail){
          return detail.items
            .reduce((total, line) => total + Number(line.splitPromotionAmount), 0)
            .toFixed(2);
        },
        paymentStatusClassV(detail){
          // 资金状态沿用商品行的 fund-* 配色：托管蓝、结算绿、退款/终态灰、待付黄
          switch(detail.paymentStatus){
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
        itemStatusClassV(line){
          switch(line.status){
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
        canSubOrderRefundV(line){
          // 退款由主订单与子订单共同决定：主订单已发货或已完成，且行款项仍在平台托管中才可发起
          const mainOrderSupportRefund = this.orderDetail.orderStatus==PhysicalOrderStatusEnum.SHIPPED
            || this.orderDetail.orderStatus==PhysicalOrderStatusEnum.COMPLETED;
          return mainOrderSupportRefund && line.status==PhysicalOrderItemStatusEnum.PAID;
        },
        canDeliverOrderV(order){
          // 已支付（即待发货）的订单才能发货，已发货及之后的状态不再提供入口
          return order.orderStatus==PhysicalOrderStatusEnum.PAID;
        },
        showDeliverOrderModalV(order){
          // 重置表单与展示数据，避免上一单残留
          this.deliverOrderObj = emptyDeliverForm(order.orderId);
          handleFetch(fetchOrderDetail(order.orderId), (data)=>{
            const detail = data.detail;
            // 只回填收件信息与商品行，不动商家正在填的表单字段
            Object.assign(this.deliverOrderObj, {
              recipient: detail.recipient,
              recipientPhone: detail.recipientPhone,
              shippingAddress: detail.shippingAddress,
              items: detail.items
            });
            $("#deliverOrderModal").modal("show"); // show modal
          });
        },
        deliverItemCountV(){
          // 多商品订单按行汇总件数，便于发货前核对
          return this.deliverOrderObj.items
            .reduce((total, line) => total + (Number(line.quantity) || 1), 0);
        },
        needDeliveryNoV(){
          return !!this.deliverOrderObj.shippingMethod && this.deliverOrderObj.shippingMethod!=SELF_DELIVERY_COMPANY;
        },
        needDeliveryPhoneV(){
          return this.deliverOrderObj.shippingMethod==SELF_DELIVERY_COMPANY;
        },
        deliverFormErrorV(){
          const deliver = this.deliverOrderObj;
          if(!deliver.shippingMethod){
            return "请填写配送方式";
          }
          if(this.needDeliveryNoV() && !deliver.shippingNumber){
            return "请填写物流单号";
          }
          if(this.needDeliveryPhoneV() && !deliver.courierPhone){
            return "请填写配送联系电话";
          }
          if(deliver.courierPhone && !validateEmailOrPhoneInput(deliver.courierPhone)){
            return "请填写正确的配送联系电话";
          }
          return "";
        },
        validateDeliverFormReadyV(){
          return !this.deliverFormErrorV();
        },
        confirmDeliverOrderV(){
          const deliver = this.deliverOrderObj;
          const error = this.deliverFormErrorV();
          if(!!error){
            customAlert.alert(error);
            return;
          }
          handleAction(deliverPhysicalOrder({
            orderId: deliver.orderId,
            shippingMethod: deliver.shippingMethod,
            // 自主配送没有物流单号，不提交表单里可能残留的值
            shippingNumber: this.needDeliveryNoV() ? deliver.shippingNumber : "",
            courierPhone: deliver.courierPhone,
            shippingNote: deliver.shippingNote
          }), {tip: "发货成功，买家签收后点击确认送达"}).then(data=>{
            if(!!data){
              $("#deliverOrderModal").modal("hide"); // hide modal
            }
          });
        },
        canConfirmReceiptOrderV(order){
          // 已发货的订单才需确认送达，送达前（待支付/待发货）和终态（已完成/已关单等）都不提供入口
          return order.orderStatus==PhysicalOrderShippingStatusEnum.SHIPPED;
        },
        confirmReceiptOrderV(order){
          handleAction(changePhysicalOrderStatus({
            orderId: order.orderId,
            orderStatus: PhysicalOrderStatusEnum.COMPLETED
          }), {tip: "已确认送达，结算权限将于下单 7 日后开放"});
        },
        canRemitOrderV(order){
          const openDate = new Date(order.createAt);
          openDate.setDate(openDate.getDate() + 7);
          return openDate < new Date()
            && order.orderStatus==PhysicalOrderStatusEnum.COMPLETED
            && order.paymentStatus==PhysicalOrderPaymentStatusEnum.PAID;
        },
        remitOrderV(order){
          handleAction(remitPhysicalOrder(order.orderId), {tip: "收取货款成功"});
        },
        hasDeliveredV(delivery){
          // 已发货（配送中或已送达）才有完整配送信息
          return delivery.shippingStatus==PhysicalOrderShippingStatusEnum.SHIPPED
            || delivery.shippingStatus==PhysicalOrderShippingStatusEnum.DELIVERED;
        },
        deliveryStatusV(shippingStatus){
          switch(shippingStatus){
            case PhysicalOrderShippingStatusEnum.SHIPPED:
              return "配送中";
            case PhysicalOrderShippingStatusEnum.DELIVERED:
              return "已送达";
            default:
              return "待发货";
          }
        },
        deliveryStatusClassV(shippingStatus){
          switch(shippingStatus){
            case PhysicalOrderShippingStatusEnum.SHIPPED:
              return "delivery-status-shipping";
            case PhysicalOrderShippingStatusEnum.DELIVERED:
              return "delivery-status-delivered";
            default:
              return "delivery-status-pending";
          }
        },
        showDeliveryInfoModalV(order){
          // 配送信息由接口单独返回，先置为当前订单占位，避免残留上一单数据
          this.deliveryInfoObj = { orderId: order.orderId };
          handleFetch(fetchDeliveryInfo(order.orderId), (data)=>{
            this.deliveryInfoObj = data.delivery;
            $("#deliveryInfoModal").modal("show"); // show modal
          });
        },
        displayTextInfoOrBlankDashV(info){
          return info || "--";
        },
        copyValueToClipboardV(content){
          if(!content){
            return;
          }
          copyValueToClipboard(content);
        },
        fullAddressTextV(delivery){
          // 商家打单场景：拼接收件人＋完整电话＋地址，便于一次复制粘贴给快递
          return [delivery.recipient, delivery.recipientPhone, delivery.shippingAddress]
            .filter(item => !!item)
            .join(" ");
        },
        showSubOrderRefundV(line){
          this.subOrderRefundObj = {
            ...emptyRefundForm(),
            orderId: line.orderId,
            orderItemId: line.orderItemId,
            productName: line.productName,
            quantity: line.quantity,
            productPrice: line.productPrice,
            productThumbnail: line.productThumbnail,
            splitPayAmount: line.splitPayAmount,
            refundReason: "",
            term: ""
          };
          $("#subOrderRefundModal").modal("show"); // show modal
        },
        isRefundAuthorizedV(){
          return this.subOrderRefundObj.term==REFUND_AUTH_TERM;
        },
        submitSubOrderRefundV(){
          const refund = this.subOrderRefundObj;
          // 行标识与退款原因必填：提交按钮只禁用授权缺失，其余靠这里拦截
          if(!refund.orderItemId){
            customAlert.alert("未选中商品，请从订单明细重新发起退款");
            return;
          }
          if(!refund.refundReason){
            customAlert.alert("请填写退款原因");
            return;
          }
          if(!this.isRefundAuthorizedV()){
            customAlert.alert("请输入“我支持退款”完成退款授权");
            return;
          }

          handleAction(subOrderRefund({
            scene: RefundSceneEnum.PHYSICAL_ORDER_ITEM,
            param: JSON.stringify({
              orderItemId: refund.orderItemId,
              refundReason: refund.refundReason,
              term: refund.term
            })
          }), {tip: "退款申请已提交，平台核验通过后将原路退回买家"}).then(data=>{
            if(!!data){
              this.reloadOrderDetailV();
              $("#subOrderRefundModal").modal("hide"); // hide modal
            }
          });
        },
        retrieveOrderTbV(){
            retrievPhysicalOrderTb();
        },
        filterOrderByStatusV(){
            filterOrderByStatus();
        }
    },
    updated(){
        $('[data-popper-reference-hidden]').remove();
        $('.popover.custom-popover.bs-popover-auto.fade.show').remove();
        // Enable popovers
        [...document.querySelectorAll('[data-bs-toggle="popover"]')].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl))
    }
}
const app = createApp(RootComponent);
app.mixin(Pagination);
app.mixin(new Auth({need_permission : true}));
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : false,
    scene: EventFeedScene.STUDIO}));
app.mixin(ImageAdaptiveComponent);
app.mixin(CodeExplainComponent);
app.mixin(DirectiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('content')
}
app.mixin(new FriendListCompoent({need_init: true}));

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
window.sPhysicalOrderPage= physicalOrderPage;

// init
physicalOrderPage.pageInit(physicalOrderPage.physicalOrderList_pagination);

function retrievPhysicalOrderTb(){
    physicalOrderPage.physicalOrderList_pagination.param.status="";
    physicalOrderPage.physicalOrderList_pagination.size = 10;
    physicalOrderPage.physicalOrderList_pagination.current = 1;
    physicalOrderPage.reloadPage(physicalOrderPage.physicalOrderList_pagination);
}
function filterOrderByStatus(){
    physicalOrderPage.physicalOrderList_pagination.current=1;
    physicalOrderPage.reloadPage(physicalOrderPage.physicalOrderList_pagination);
}

// 一个接口一个函数：只返回响应体（网络异常保持 reject，由 handleFetch / handleAction 捕获）
async function unwrap(axiosPromise){
  const response = await axiosPromise;
  return response.data;
}
async function fetchOrderDetail(orderId){
  const url = "/api/v1/web_estudio/physical_order/{order_id}/detail".replace("{order_id}",orderId);
  return await unwrap(axios.get(url));
}
async function fetchDeliveryInfo(orderId){
  const url = "/api/v1/web_estudio/physical_order/{order_id}/delivery_info".replace("{order_id}",orderId);
  return await unwrap(axios.get(url));
}
async function deliverPhysicalOrder(dto){
  return await unwrap(axios.put("/api/v1/web_estudio/physical_order/delivery",dto));
}
async function changePhysicalOrderStatus(dto){
  return await unwrap(axios.put("/api/v1/web_estudio/physical_order/change_status",dto));
}
async function remitPhysicalOrder(orderId){
  const url = "/api/v1/web_estudio/physical_order/{order_id}/remittances".replace("{order_id}",orderId);
  return await unwrap(axios.post(url,{}));
}
async function subOrderRefund(dto){
  return await unwrap(axios.post("/api/v1/web_estudio/order/refund",dto));
}

$(function(){
	$(".tooltip-nav").tooltip();
});



// 发货弹窗状态：表单字段由商家填写，收件信息与商品行在打开弹窗时按订单号拉取回填
function emptyDeliverForm(orderId){
  return {
    orderId: orderId,
    shippingMethod: "",
    shippingNumber: "",
    courierPhone: "",
    shippingNote: "",
    recipient: "",
    recipientPhone: "",
    shippingAddress: "",
    items: []
  };
}

// 退款弹窗初始值：展示用的商品信息在打开弹窗时从商品行带入
function emptyRefundForm(){
  return {
    orderId: "",
    orderItemId: "",
    productName: "",
    quantity: "",
    productPrice: "",
    productThumbnail: "",
    splitPayAmount: "",
    refundReason: "",
    term: ""
  };
}

// 读接口：code 200 时把响应体交给渲染回调，失败与网络异常统一告警
function handleFetch(promise, render){
  promise.then(data=>{
    if(data.code!=200){
      customAlert.alert(REQUEST_FAIL_TIP + data.message);
      return;
    }
    render(data);
  }).catch(error=>{
    customAlert.alert(REQUEST_FAIL_TIP + error);
  });
}

// 写接口：成功时刷新列表并按需提示，返回响应体供调用方继续收尾（如关闭弹窗）
async function handleAction(promise, options){
  const result = await promise
    .then(data=>({ok: data.code==200, data: data}))
    .catch(error=>({ok: false, message: error}));
  if(!result.ok){
    // 非 200 取接口回的 message，网络异常取抛出的 error
    customAlert.alert(REQUEST_FAIL_TIP + (result.data ? result.data.message : result.message));
    return;
  }
  physicalOrderPage.reloadPage(physicalOrderPage.physicalOrderList_pagination); // refresh tb
  if(!!options.tip){
    customAlert.alert(options.tip);
  }
  return result.data;
}
