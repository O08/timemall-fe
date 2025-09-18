import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import Pagination  from "/common/javascripts/pagination-vue.js";
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'
import Auth from "/estudio/javascripts/auth.js"

import {EventFeedScene} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import {CodeExplainComponent} from "/common/javascripts/compoent/code-explain-compoent.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";
import {Api} from "/common/javascripts/common-api.js";


import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const RootComponent = {
    data() {
        return {
            btn_ctl:{
              changeOrderPackObj_already_change: false
            },
            changeOrderPackObj: {
              orderNO: "",
              orderId: "",
              pack: ""
            },
            orderMaintenanceObj:{
              tag: "",
              orderId: ""
            },
            deliverMaterial: {},
            refundObj: {
              orderId: "",
              term: ""
            },
            virtual_pagination:{
                url: "/api/v1/web_estudio/virtual/order/list",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                    q: "",
                    tag: ""
                },
                paging: {},
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.virtual_pagination.size = response.order.size;
                        this.virtual_pagination.current = response.order.current;
                        this.virtual_pagination.total = response.order.total;
                        this.virtual_pagination.pages = response.order.pages;
                        this.virtual_pagination.records = response.order.records;
                        this.virtual_pagination.paging = this.doPaging({current: response.order.current, pages: response.order.pages, size: 5});
                    }
                }
            }
        }

    },
    methods: {
        canRemittanceV(order){
          const createAtDate = new Date(order.createAt);
          const openDate= createAtDate.setDate(createAtDate.getDate()+7);
          return openDate<new Date() && order.alreadyPay=='1' && order.alreadyRemittance!='1' && order.alreadyRefund!='1';
        },
        getMoneyStatusV(order){
          if(order.alreadyRefund=='1'){
            return "已退回款项";
          }
          if(order.alreadyRemittance=='1'){
            return "已收回货款";
          }
          if(order.alreadyPay=='1'){
            return "平台托管中";
          }
          return "";

        },
        maintenanceOrderV(){
          maintenanceOrder(this.orderMaintenanceObj).then(response=>{
            if(response.data.code==200){
              this.reloadPage(this.virtual_pagination); // refresh tb
              $("#orderManagementModal").modal("hide"); // show modal

            }
            if(response.data.code!=200){
                const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                customAlert.alert(error);
            }

          }).catch(error=>{
              customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
          });
        },
        changeOrderPackInfoV(){
          changeOrderPackInfo(this.changeOrderPackObj).then(response=>{
            if(response.data.code==200){
              this.reloadPage(this.virtual_pagination); // refresh tb
              $("#changeOrderPackModal").modal("hide"); // show modal

            }
            if(response.data.code!=200){
                const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                customAlert.alert(error);
            }

          }).catch(error=>{
              customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
          });
        },
        showChangeOrderPackModalV(order){
          this.changeOrderPackObj.orderId=order.orderId;
          this.changeOrderPackObj.pack=order.pack;
          this.changeOrderPackObj.orderNO=order.orderNO;
          this.btn_ctl.changeOrderPackObj_already_change=false;
          $("#changeOrderPackModal").modal("show"); // show modal

        },
        showOrderMaintenanceModalV(orderId){
          this.orderMaintenanceObj.orderId= orderId;
          this.orderMaintenanceObj.tag="";
          $("#orderManagementModal").modal("show"); // show modal
        },
        showRefundModalV(orderId){
          this.refundObj.orderId= orderId;
          this.refundObj.term="";
          $("#orderRefundModal").modal("show"); // show modal
        },
        refundV(){
          Api.virtualProductOrderRefund(this.refundObj.orderId,this.refundObj.term).then(response=>{
            if(response.data.code==200){
              this.reloadPage(this.virtual_pagination); // refresh tb
              $("#orderRefundModal").modal("hide"); // show modal
              customAlert.alert("订单已退款！");
            }
            if(response.data.code!=200){
                const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                customAlert.alert(error);
            }

          }).catch(error=>{
              customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
          });
        },
        remittanceV(orderId){
          remittance(orderId).then(response=>{
            if(response.data.code==200){

              this.reloadPage(this.virtual_pagination); // refresh tb
              customAlert.alert("收取货款成功");

            }
            if(response.data.code!=200){
              const errorInfo="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
              customAlert.alert(errorInfo);
            }
          })
        },
        showViewDeliverMaterialModalV(orderId){
          fetchDeliverMaterial(orderId).then(response=>{
              if(response.data.code==200){
  
                  this.deliverMaterial = response.data.deliver;
                  $("#deliverMaterialViewModal").modal("show"); // show modal
  
              }
              
          })
        },
        retrieveCellPlanOrderTbV(){
            retrieveCellPlanOrderTb();
        },
        retrieveCellPlanOrderListByPlanTypeV(){
            retrieveCellPlanOrderListByPlanType();
        },
        retrieveMpsPaperListByTagV(){
            retrieveMpsPaperListByTag();
        }
    },
    updated(){
        $('[data-popper-reference-hidden]').remove();
        $('.popover.custom-popover.bs-popover-auto.fade.show').remove();
        // Enable popovers 
        const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
        const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl))
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
                virtualOrderPage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);
const virtualOrderPage = app.mount('#app');
window.sVirtualOrderPage= virtualOrderPage;

// init 
virtualOrderPage.pageInit(virtualOrderPage.virtual_pagination);

function retrieveCellPlanOrderTb(){
    virtualOrderPage.virtual_pagination.param.planType="";
    virtualOrderPage.virtual_pagination.param.tag="";
    virtualOrderPage.virtual_pagination.size = 10;
    virtualOrderPage.virtual_pagination.current = 1;
    virtualOrderPage.reloadPage(virtualOrderPage.virtual_pagination);
}
function retrieveCellPlanOrderListByPlanType(){
    virtualOrderPage.virtual_pagination.current=1;
    virtualOrderPage.reloadPage(virtualOrderPage.virtual_pagination);
}
function retrieveMpsPaperListByTag(){
    virtualOrderPage.virtual_pagination.current=1;
    virtualOrderPage.reloadPage(virtualOrderPage.virtual_pagination); 
}

async function doFetchDeliverMaterial(orderId){

  const url ="/api/v1/web_pod/virtual/order/{id}/deliver".replace("{id}",orderId);
  return await axios.get(url);

}

async function doRemittance(orderId){
  const url = "/api/v1/web_estudio/virtual/order/{order_id}/remittance".replace("{order_id}",orderId);
  return await axios.post(url,{});
}

async function doModifyOrderTag(dto){
  const url = "/api/v1/web_estudio/brand/virtual/product/order/maintenance";
  return await axios.put(url,dto);
  
}
async function doChangeOrderPackInfo(dto){
  const url = "/api/v1/web_estudio/virtual/product/order/pack/change";
  return await axios.put(url,dto);
}
async function changeOrderPackInfo(dto){
  return await doChangeOrderPackInfo(dto);
}
async function maintenanceOrder(dto){
  return await doModifyOrderTag(dto);
}
async function remittance(orderId){
  return await doRemittance(orderId);
}
async function fetchDeliverMaterial(orderId){

  return await doFetchDeliverMaterial(orderId);
 
 }


 
$(function(){
	$(".tooltip-nav").tooltip();
});
