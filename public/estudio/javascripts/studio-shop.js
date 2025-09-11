import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"

import {getDaysBetween}from "/common/javascripts/util.js";
import TopUpCompoent from "/estudio/javascripts/compoent/TopUpCompoent.js";
import {EventFeedScene} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";

import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();


const RootComponent = {
    data() {
        return {
            product_bluesign: {
                tradingName: "蓝标",
                price: "30"
            },
            product_electricity: {
                electricity: "0",
                tradingName: "200 电量值",
                price: "20"
            }
        }
    },
    methods: {
        buyElectricityProductV(){
            buyElectricityProduct()
        },
        buyVipProductV(){
            buyVipProduct()
        },
        init(){
            initBlueSign();
            fetchProductElectricity();
        },
        getDaysBetweenV(begainDate,endDate){
            if(!begainDate || !endDate){
                return;
            }
            return getDaysBetween(begainDate,endDate);
        },
        enableBluesignV(){
            return Date.parse(this.product_bluesign.blueEndAt) > new Date().getTime() ;
        }
    }
}
const app = createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(TopUpCompoent);
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : false,
    scene: EventFeedScene.STUDIO}));
app.mixin(ImageAdaptiveComponent);
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
                shopPage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);
const shopPage = app.mount('#app');
window.cShop = shopPage;


async function getBlueSign(){
    const brandId =  shopPage.getIdentity().brandId; // Auth.getIdentity();
    const url = "/api/v1/web_estudio/shop/bluesign?brand_id="+brandId;
    return await axios.get(url)
}

async function buyVipOrder(){
    const url = "/api/v1/web_estudio/order/new_order";
    return await axios.post(url);
}


async function getElectricityInfo(){
    const url = "/api/v1/web_estudio/shop/electricity/query";
    return await axios.get(url)
}
async function buyElectricity(){
    const url = "/api/v1/web_estudio/shop/electricity/buy";
    return await axios.post(url);
}

async function buyElectricityProduct() {

    buyElectricity().then((response) => {
        if (response.data.code == 200) {

            fetchProductElectricity();
            shopPage.getDrawableV(); // from topupcompoent.js
            $("#electricityBuyModal").modal("hide");
            customAlert.alert("电力商品购买成功");

        }
        if (response.data.code != 200) {
            customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message);
        }
    }).catch(error => {
        customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
    });

}
async function fetchProductElectricity(){
    getElectricityInfo().then((response)=>{
        if(response.data.code == 200){
            shopPage.product_electricity= response.data.product
        }
    })
}

async function initBlueSign(){
    getBlueSign().then((response)=>{
        if(response.data.code == 200){
            shopPage.product_bluesign = response.data.bluesign
        }
    })
}

async function buyVipProduct() {

    buyVipOrder().then((response) => {
        if (response.data.code == 200) {
            initBlueSign();
            shopPage.getDrawableV(); // from topupcompoent.js
            fetchProductElectricity();

            $("#blueSignBuyModal").modal("hide");
            customAlert.alert("蓝标商品购买成功");

        }
        if (response.data.code != 200) {
            customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message);
        }
    }).catch(error => {
        customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
    });

}
// init 
shopPage.init();


// dom relative control
$(".product-blue-sign .product-img").on("click",()=>{
    
    if(shopPage.enableBluesignV()){
        return
    }
    $("#blueSignBuyModal").modal("show");
})
$(".product-top_up .product-img").on("click",()=>{
    

    $("#topUpModal").modal("show");
})

$(".electrcity-top_up .product-img").on("click",()=>{
    

    $("#electricityBuyModal").modal("show");
})

$(function(){
	$(".tooltip-nav").tooltip();
});