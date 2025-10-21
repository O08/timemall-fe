import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';

import Auth from "/estudio/javascripts/auth.js"
import AppApi from "/apps/common/javascripts/AppApi.js";
import { getQueryVariable } from "/common/javascripts/util.js";
import Pagination  from "/common/javascripts/pagination-vue.js";
import { CodeExplainComponent } from "/common/javascripts/compoent/code-explain-compoent.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";


import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';

let customAlert = new CustomAlertModal();

const currentOch = getQueryVariable("och");

const RootComponent = {
  data() {
    return {
      btn_ctl: {
        changeOrderPackObj_already_change: false
      },
      genres:[],
      orderDetail: {

      },
      dashboard: {
        soldOrders: "-",
        shippingOrders: "-",
        buyers: "-",
        totalSales: "-"
      },
      general: {
        channelName: "",
        channelDesc: "",
        och: ""
      },
      refundObj: {
        orderId: "",
        term: ""
      },
      changeOrderPackObj: {
        orderNo: "",
        orderId: "",
        deliveryNote: ""
      },
      orderMaintenanceObj: {
        status: "",
        orderId: ""
      },
      orderList_pagination: {
        url: "/api/v1/app/redeem/admin/order/list",
        size: 10,
        current: 1,
        total: 0,
        pages: 0,
        records: [],
        paging: {},
        param: {
            q: '',
            status: '',
            genreId: '',
            channel: currentOch
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
    loadGenreListV(){
      loadGenreList(currentOch).then(response=>{
          if(response.data.code == 200){

            this.genres=response.data.genre;
          }
      });
  },
    filterOrderListV(){
      this.orderList_pagination.current = 1;
      this.reloadPage(this.orderList_pagination);
    },
    searchOrderListV(){
        this.orderList_pagination.current = 1;
        this.orderList_pagination.param.status="";
        this.orderList_pagination.param.genreId="";
        this.reloadPage(this.orderList_pagination);
    },
    findDashboardV(){
      findDashboard(currentOch).then(response=>{
        if(response.data.code == 200 && !!response.data.dashboard  ){
            
            this.dashboard=response.data.dashboard ;
        }
    });
    },
    fetchChannelGeneralInfoV() {
      const och = getQueryVariable("och");
      AppApi.fetchChannelGeneralInfo(och).then(response => {
        if (response.data.code == 200) {
          this.general = !response.data.channel ? {} : response.data.channel;
          this.general.och = och;
          document.title = this.general.channelName + " | 订单管理";
        }
      });
    },
    showChangeOrderPackModalV(order) {
      this.changeOrderPackObj.orderId=order.orderId;
      this.changeOrderPackObj.deliveryNote=order.deliveryNote;
      this.changeOrderPackObj.orderNo=order.orderNo;
      this.changeOrderPackObj.deliveryMaterial=order.deliveryMaterial;
      this.changeOrderPackObj.productName=order.productName;
      this.btn_ctl.changeOrderPackObj_already_change=false;
      document.querySelector('#changeOrderPack_material').value = null;

      $("#changeOrderPackModal").modal("show"); // show modal
    },
    changeOrderPackV(){
      const deliveryMaterial = document.getElementById("changeOrderPack_material").files[0];
      this.changeOrderPackObj.deliveryMaterial=deliveryMaterial;
      changeOrderPack(this.changeOrderPackObj).then(response=>{
        if(response.data.code == 200){
            
          this.reloadPage(this.orderList_pagination);
          $("#changeOrderPackModal").modal("hide");

        }
        if(response.data.code!=200){
            const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
            customAlert.alert(error); 
        }
      });
    },
    showRefundModalV(order) {
      this.refundObj.orderId=order.orderId;
      this.refundObj.term="";
      $("#orderRefundModal").modal("show"); // show modal
    },
    refundV(){
      refund(this.refundObj).then(response=>{
        if(response.data.code == 200){
            
          this.reloadPage(this.orderList_pagination);
          $("#orderRefundModal").modal("hide");

        }
        if(response.data.code!=200){
            const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
            customAlert.alert(error); 
        }
      });
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
    showOrderMaintenanceModalV(orderId) {
      this.orderMaintenanceObj.orderId= orderId;
      this.orderMaintenanceObj.status="";
      $("#orderManagementModal").modal("show"); // show modal
    },
    changeOrderStatusV(){
      changeOrderStatus(this.orderMaintenanceObj).then(response=>{
        if(response.data.code==200){
          this.reloadPage(this.orderList_pagination); // refresh tb
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
  }
}

let app = createApp(RootComponent);
app.mixin(new Auth({ need_permission: true }));
app.mixin(Pagination);
app.mixin(ImageAdaptiveComponent);

app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('col-')
}
app.mixin(CodeExplainComponent);
app.mixin(DirectiveComponent);

const redeemAppOrder = app.mount('#app');


window.redeemAppOrderPage = redeemAppOrder;

redeemAppOrder.pageInit(redeemAppOrder.orderList_pagination);

redeemAppOrder.fetchChannelGeneralInfoV();

redeemAppOrder.findDashboardV();

redeemAppOrder.loadGenreListV();



async function fetchDashboard(channel){
  const url="/api/v1/app/redeem/admin/order/dashboard?channel="+channel;
  return await axios.get(url);
}

async function findDashboard(channel){
   return await fetchDashboard(channel);
}
async function fetchGenreList(channel,q){
  const url="/api/v1/app/redeem/genre/list?channel="+channel+"&q="+q;
  return await axios.get(url);
}


async function fetchOrderInfo(orderId){
  const url="/api/v1/app/redeem/admin/order/{id}/info".replace("{id}",orderId);
  return await axios.get(url);
}

async function doRefund(dto){
  const url="/api/v1/app/redeem/order/refund";
  return await axios.post(url,dto);
}

async function doMarkOrderStauts(dto){
  const url="/api/v1/app/redeem/admin/order/mark";
  return await axios.put(url,dto);
}

async function doModifyOrderPack(deliverInfo){
  var form=new FormData();
  form.append("orderId",deliverInfo.orderId);
  form.append("deliveryNote",deliverInfo.deliveryNote);
  if(!!deliverInfo.deliveryMaterial){
    form.append("deliveryMaterial",deliverInfo.deliveryMaterial);
  }

  const url="/api/v1/app/redeem/admin/order/deliver";
  return await axios.put(url,form);
}
async function changeOrderPack(deliverInfo){
  return await doModifyOrderPack(deliverInfo);
}
async function changeOrderStatus(dto){
  return await doMarkOrderStauts(dto);
}
async function refund(dto){
   return await doRefund(dto);
}
async function findOrderInfo(orderId){
  return await fetchOrderInfo(orderId);
}
async function loadGenreList(channel){
  return await fetchGenreList(channel,'');
}






