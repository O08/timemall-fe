import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"

import BrandInfoComponent from "/estudio/javascripts/load-brandinfo.js";

import {getDaysBetween}from "/common/javascripts/util.js";
import TopUpCompoent from "/estudio/javascripts/compoent/TopUpCompoent.js";
import {EventFeedScene} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";





const RootComponent = {
    data() {
        return {
            product_bluesign: {}
        }
    },
    methods: {
        buyProductV(){
            buyProduct()
        },
        init(){
            initBlueSign()
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
app.mixin(BrandInfoComponent);
app.mixin(TopUpCompoent);
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : false,
    scene: EventFeedScene.STUDIO}));
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('content')
}
const shopPage = app.mount('#app');
window.cShop = shopPage;


async function getBlueSign(){
    const brandId =  shopPage.getIdentity().brandId; // Auth.getIdentity();
    const url = "/api/v1/web_estudio/shop/bluesign?brand_id="+brandId;
    return await axios.get(url)
}

async function newOrder(productCode){
    const url = "/api/v1/web_estudio/order/new_order";
    return await axios.post(url,productCode);
}


async function initBlueSign(){
    getBlueSign().then((response)=>{
        if(response.data.code == 200){
            shopPage.product_bluesign = response.data.bluesign
        }
    })
}

async function buyProduct(){

    var productCode = '';
    newOrder(productCode).then((response)=>{
        if(response.data.code == 200){
            // if create order success ,forward to pay 
            const merchantUserId = response.data.order.merchantUserId;
            const merchantOrderId = response.data.order.merchantOrderId;
            window.location.href= '/api/payment/goAlipay.html?merchantUserId=' + merchantUserId + '&merchantOrderId=' + merchantOrderId;
        }
    })
 
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

