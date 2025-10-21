import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 

import { getQueryVariable } from "/common/javascripts/util.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import Pagination  from "/common/javascripts/pagination-vue.js";
import  AppApi from "/apps/common/javascripts/AppApi.js";
import { CodeExplainComponent } from "/common/javascripts/compoent/code-explain-compoent.js";
import { renderDateToDayInChina,getDayName } from "/common/javascripts/util.js";
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'




import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';

let customAlert = new CustomAlertModal();

const sandboxEnv= getQueryVariable("sandbox");
const currentOch = window.location.pathname.split('/').pop();

const RootComponent = {
    data() {
      return {
        focusModal:{
            feed: "",
            confirmHandler:()=>{

            }
        },
        genres:[],
        sandbox: !sandboxEnv ? "0" : sandboxEnv,
        feedArr: [],
        productProfile: {
            price: 0
        },
        newOrderObj:{
            productId: "",
            quantity: 1
        },
        currentUserPoints: 0,
        feedList_pagination: {
            url: "/api/v1/app/redeem/buyer/product/list",
            size: 24,
            current: 1,
            total: 0,
            pages: 0,
            records: [],
            isLoading: false,
            param: {
              q: '',
              sort: "1",
              genreId: "",
              channel: currentOch
            },
            responesHandler: (response)=>{
                if(response.code == 200){
                    this.feedList_pagination.size = response.product.size;
                    this.feedList_pagination.current = response.product.current;
                    this.feedList_pagination.total = response.product.total;
                    this.feedList_pagination.pages = response.product.pages;
                    this.feedList_pagination.records = response.product.records;
                    this.feedList_pagination.isLoading = false;
                    this.feedArr.push(...response.product.records);
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
        loadPointsInfoV(){
            AppApi.retrieveBrandPoint(currentOch).then(response=>{
                if(response.data.code == 200){
                    this.currentUserPoints=response.data.point;
                }
        
            });
        },
        showProductInfoModalV(productId) {
            this.newOrderObj.productId=productId;
            this.newOrderObj.quantity=1;
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
            this.captueItemDataV(productId);
        },
        showOrderProductFocusModalV(){

           
            this.focusModal.feed=this.productProfile.productName;
            this.focusModal.confirmHandler=()=>{
                this.orderNowV();
               this.closeOrderProductFocusModalV();
            };
            $("#productInfoModal").modal("hide");
            $("#focusModal").modal("show"); // show modal
        },
        closeOrderProductFocusModalV(){
            $("#productInfoModal").modal("show");
            $("#focusModal").modal("hide");
        },
        orderNowV(){
            orderProduct(this.newOrderObj).then(response=>{
                if(response.data.code == 200){
                    $("#productInfoModal").modal("hide");
                    this.loadPointsInfoV();
                    customAlert.alert("兑换成功，可通过【奇迹工坊】-【兑换记录】查看已兑换的商品"); 
                }
                if(response.data.code==40007){
                    customAlert.alert("余额不足，可通过 「助力部落」 或 接取本部落发布的委托任务获取贡献点"); 
                    return ;
                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error); 
                }
        
            });
        },
        retrieveFeedListV(){
            this.feedArr=[]; // reset feed 
            this.feedList_pagination.current = 1;
            this.feedList_pagination.param.sort="1";
            this.feedList_pagination.param.genreId="";
            this.reloadPage(this.feedList_pagination);
        },
        sortFeedListV(){
            this.feedArr=[]; // reset feed 
            this.feedList_pagination.current = 1;
            this.reloadPage(this.feedList_pagination);
        },
        filterFeedListV(genreId){
            this.feedArr=[]; // reset feed 
            this.feedList_pagination.current = 1;
            this.feedList_pagination.param.genreId=genreId;
            this.reloadPage(this.feedList_pagination);
        },
        canShowReminderV(releaseAt){
            if(!releaseAt){
                return false
            }
            return new Date()<new Date(releaseAt);
               
        },
        formatCmpctNumberV(number){
            return formatCmpctNumber(number);
        },
        captueItemDataV(itemId){
            captueItemDataBO(itemId);
        },
        fetchChannelGeneralInfoV(){
       
            AppApi.fetchChannelGeneralInfo(currentOch).then(response=>{
                if(response.data.code == 200){
                    var title = !response.data.channel ? "兑换中心" : response.data.channel.channelName;
                    document.title = title + " | bluvarri.com";
                }
            });
        },
        renderDateToDayInChinaV(dateStr){
            return renderDateToDayInChina(dateStr);
        },
        getDayNameV(dateStr){
            return getDayName(dateStr);
        },
        decreaseQuantityV(){
            if(this.newOrderObj.quantity>1){
                this.newOrderObj.quantity=this.newOrderObj.quantity-1;
            }
        },
        increaseQuantityV(){
            if(this.newOrderObj.quantity>=this.productProfile.inventory){
                return
            }
            var maxQuota=0;
            if(this.productProfile.salesQuotaType=='per_person'){
                maxQuota=Math.max(this.productProfile.salesQuota-this.productProfile.historyBuyerOrders,0)
            }
            if(this.productProfile.salesQuotaType=='month_limit'){
                maxQuota=Math.max(this.productProfile.salesQuota-this.productProfile.monthBuyerOrders,0)
            }
            if(this.newOrderObj.quantity<maxQuota){
                this.newOrderObj.quantity=this.newOrderObj.quantity+1;
            }
        },
        hasQuotaV(){
            var maxQuota=0;
            if(this.productProfile.salesQuotaType=='per_person'){
                maxQuota=Math.max(this.productProfile.salesQuota-this.productProfile.historyBuyerOrders,0)
            }
            if(this.productProfile.salesQuotaType=='month_limit'){
                maxQuota=Math.max(this.productProfile.salesQuota-this.productProfile.monthBuyerOrders,0)
            }
            return maxQuota > 0;
        },
        showMoreV(){
            showMore();
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
let app =  createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);
app.mixin(Pagination);
app.mixin(CodeExplainComponent);

const redeemApp = app.mount('#app');

window.redeemAppPage = redeemApp;

redeemApp.pageInit(redeemApp.feedList_pagination);
redeemApp.fetchChannelGeneralInfoV();
redeemApp.loadGenreListV();
redeemApp.loadPointsInfoV();

async function captueItemData(itemId){
    const dto={
    }
    const url="/api/v1/app/redeem/product/{id}/data_science".replace("{id}",itemId);;
    return await axios.put(url,dto);
}
async function fetchGenreList(channel,q){
    const url="/api/v1/app/redeem/genre/list?channel="+channel+"&q="+q;
    return await axios.get(url);
}
async function fetchProductInfo(productId){
    const url="/api/v1/app/redeem/product/{id}/profile".replace("{id}",productId);
    return await axios.get(url);
}
async function doOrderProduct(order){
    const url="/api/v1/app/redeem/product/order/new";
    return await axios.post(url,order);
}
async function orderProduct(order){
   return await doOrderProduct(order);
}
async function findProductProfile(productId){
    return await fetchProductInfo(productId);
}
async function loadGenreList(channel){
    return await fetchGenreList(channel,'');
 }
async function captueItemDataBO(itemId){
    return await captueItemData(itemId);
}

function showMore(){
    if(redeemApp.feedList_pagination.isLoading){
        return;
    }
    redeemApp.feedList_pagination.current = redeemApp.feedList_pagination.current +  1;
    redeemApp.feedList_pagination.isLoading = true;

    redeemApp.reloadPage(redeemApp.feedList_pagination);

}

var options = {
    notation: "compact",
    compactDisplay: "short",
};
function formatCmpctNumber(number) {
  const usformatter = Intl.NumberFormat("zh-CN", options);
  return usformatter.format(number);
}

// Enable popovers 

const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl))

$(function(){
	$(".tooltip-nav").tooltip();
});