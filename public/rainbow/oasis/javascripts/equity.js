import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"
import OasisAnnounceInterfaceComponent from "/rainbow/javascripts/compoent/OasisAnnounceInterfaceComponent.js"

import TeicallaanliSubNavComponent from "/rainbow/javascripts/compoent/TeicallaanliSubNavComponent.js"

import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";

import {OasisOptionCtlComponent} from '/rainbow/oasis/javascripts/oasis-option-ctl-component.js'; 
import {OasisFastLinkComponent} from '/rainbow/oasis/javascripts/oasis-fast-link-component.js'; 
import axios from "axios";
import  OasisApi from "/rainbow/javascripts/oasis/OasisApi.js";

import { renderDateInChina } from "/common/javascripts/util.js";
import { CustomAlertModal } from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();


const pathname = window.location.pathname; 
const segments = pathname.split('/').filter(Boolean); // filter(Boolean) removes empty strings from leading/trailing slashes

const [currentOasisHandle,] = segments;


const RootComponent = {
    components: {
        oasisoptions: OasisOptionCtlComponent,fastlinks: OasisFastLinkComponent
    },
    data() {

      return {
        init_finish: false,
        currentOch: '',
        equity: {},
        sponsorship: {
          shares: 1,
          agreement: false
        },
        sliderMin: 1,
        sliderMax: 1000,
        sponsorOrders: [],
        sponsorOrderCount: 0,
        brandAccount:{
            drawable: 0.00
        },
        oasisAccount:{
            drawable: 0.00
        },
        focusModal:{
            feed: "",
            confirmHandler:()=>{

            }
        },
        confirmingId: null,
        confirmTimer: null
      }
    },
    computed: {
      sliderBackground() {
        const percentage = ((this.sponsorship.shares - this.sliderMin) / (this.sliderMax - this.sliderMin)) * 100;
        return {
          background: `linear-gradient(to right, #3b82f6 ${percentage}%, #121212 ${percentage}%)`
        };
      },
      costTotal(){
        if(!this.equity) return 0.00;
        return (Number(this.sponsorship.shares) * Number(this.equity.price)).toFixed(2);
      },
      hasCredit(){
        if(!this.equity) return 0;
        return Number(this.equity.sold) < Number(this.equity.shares);
      }
    },
    methods: {
        handleJoinSuccessEventV(){
            this.loadJoinedOases(); // sub nav component.js
        },
        handleUnfollowSuccessEventV(){
            this.loadJoinedOases(); // sub nav component.js
        },
        handleOrderWriteOffClickV(order) {

          if (this.confirmingId !== order.orderId) {
            // 开启确认态
            this.confirmingId = order.orderId;
            if (this.confirmTimer) clearTimeout(this.confirmTimer);
            this.confirmTimer = setTimeout(() => {
              this.confirmingId = null;
            }, 10000);
          } else {
            clearTimeout(this.confirmTimer);
            this.confirmingId = null;
            this.writeOffOneEquityOrderV(order.orderId);
          }

        },
        renderDateInChinaV(dateStr){
          return renderDateInChina(dateStr);
        },
        showWriteOffModalV(){
          fetchSponsorLatestPeriodEquityOrderInfo(this.oasisId).then(response=>{
            if(response.data.code == 200){
                this.sponsorOrders = response.data.order.records;
                this.sponsorOrderCount=response.data.order.total;
                $("#redemptionModal").modal("show");
            }
          });
        },
        writeOffOneEquityOrderV(orderId){
          writeOffOneEquityOrder(orderId).then(response=>{
            if(response.data.code == 200){

                this.sponsorOrders = this.sponsorOrders.filter(order => order.orderId !== orderId);
                this.sponsorOrderCount--;

                this.loadPageV();

                customAlert.alert("兑现成功！相关款项已转入");
            }
            if(response.data.code==40007){
              customAlert.alert("部落余额不足，处理失败"); 
              return ;
            }
            if (response.data.code != 200) {
              const error = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message;
              customAlert.alert(error);
            }
          });
        },
        retrieveEquityInfoV(){
          fetchEquityInfo(this.oasisId).then(response=>{
            if(response.data.code == 200){
                this.equity = response.data.info;
                this.init_finish=true;
            }
          });
        },
        retrieveOasisFinInfoV(){
          OasisApi.retrieveOasisFinInfo(this.oasisId).then(response=>{
              if(response.data.code == 200){
                  this.oasisAccount.drawable = response.data.billboard.drawable;
              }
            });
        },
        retrieveBrandFinInfoV(){
          OasisApi.retrieveBrandFinInfo().then(response=>{
              if(response.data.code == 200){
                  this.brandAccount.drawable = response.data.billboard.drawable;
              }
          });
        },
        loadPageV(){
          this.retrieveEquityInfoV();
          this.retrieveOasisFinInfoV();
          this.retrieveBrandFinInfoV();
        },
        periodSoldProgress(period){
          const getRatio = (period) => (Number(period.shares) > 0 ? (100 * Number(period.sold)) / Number(period.shares) : 0);
          return Number(getRatio(period).toFixed(2));
        },
        setSharesV(toShares){
          this.sponsorship.shares=toShares;
        },
        showBuyEquityFocusModalV(){
          this.focusModal.feed="";
          this.focusModal.confirmHandler=()=>{
              this.buyEquityV();
          };
          $("#focusModal").modal("show"); // show modal
        },
        closeBuyEquityFocusModalV(){
          $("#focusModal").modal("hide"); // show modal
        },
        buyEquityV(){
          this.sponsorship.periodId=this.equity.periodId;
          buyEquity(this.sponsorship).then(response => {
            if (response.data.code == 200) {

               this.loadPageV();
               this.sponsorship.shares=1;
               this.sponsorship.agreement=false;
               this.closeBuyEquityFocusModalV();
               customAlert.alert("赞助成功，感谢您对部落的支持，祝愉快！")
    
            }
            if(response.data.code==40007){
                customAlert.alert("您的账户余额不足，处理失败"); 
                return ;
             }
             if(response.data.code==40024){
                customAlert.alert("您是管理员，管理员购买权益功能暂未开放"); 
                return ;
            }
           if(response.data.code==40038){
              customAlert.alert("【权益赞助】功能仅对已加入的成员开放"); 
              return ;
            }
            if (response.data.code != 200) {
                const error = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message;
                customAlert.alert(error);
            }
          }).catch(error => {
              customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
          });
        }
    },
    updated(){
        
        $(function () {
            $('[data-popper-reference-hidden]').remove();
            $('.popover.custom-popover.bs-popover-auto.fade.show').remove();
            // Enable popovers 
            $('[data-bs-toggle="popover"]').popover();
        });
    
    },
    beforeUnmount() {
      clearTimeout(this.confirmTimer);
    }
}


let app =  createApp(RootComponent);
app.mixin(new Auth({need_permission : true,need_init: false}));
app.mixin(OasisAnnounceInterfaceComponent);
app.mixin(TeicallaanliSubNavComponent);
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);


app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('col-') || tag.startsWith('top-')
}

const equitySponsorship = app.mount('#app');

window.equitySponsorshipPage = equitySponsorship;

equitySponsorship.userAdapter(); // auth.js init
equitySponsorship.loadSubNav() // sub nav component .js init 
equitySponsorship.loadAnnounceAndFastLinkAndChannelListUseHandleV(currentOasisHandle,equitySponsorship.loadPageV);

async function doFetchOasisLatestPeriodEquityInfo(oasisId){
  const url = "/api/v1/team/oasis/{id}/equity/latest_period/sponsorship/info".replace("{id}",oasisId);
  return await axios.get(url);
}

async function doBuyEquity(dto){
  const url = "/api/v1/team/oasis/equity/latest_period/sponsorship/buy";
  return await   axios.post(url, dto);
}
async function doFetchSponsorLatestPeriodEquityOrderInfo(params){
  const url = "/api/v1/team/oasis/equity/orders/sponsor/query?" +  new URLSearchParams(params).toString();
  return await axios.get(url);
}

async function doWriteOffOneEquityOrder(orderId){
  const url = "/api/v1/team/oasis/equity/orders/{id}/write_off".replace("{id}",orderId);
  return await   axios.post(url,{});
}

async function writeOffOneEquityOrder(orderId){
  return await doWriteOffOneEquityOrder(orderId);
}

 
async function fetchSponsorLatestPeriodEquityOrderInfo(oasisId){
  const params={
    oasisId: oasisId,
    current: 1,
    size: 20
  }
  return await doFetchSponsorLatestPeriodEquityOrderInfo(params);
}

async function buyEquity(dto){
  return await doBuyEquity(dto);
}

async function fetchEquityInfo(oasisId){
  return await doFetchOasisLatestPeriodEquityInfo(oasisId);
}



