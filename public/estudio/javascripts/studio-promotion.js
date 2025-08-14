import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"
import axios from 'axios';

import {EventFeedScene} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import { transformInputNumberAsPositive } from "/common/javascripts/util.js";

import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const RootComponent = {
    data() {
        return {
            init_finish: false,
            promotion: {},
            updatePromotionObj: {}
        }
    },
    methods: {
        showSetupCreditPointModalV(){
            this.updatePromotionObj= JSON.parse(JSON.stringify(this.promotion));
            $("#setupCreditPointModal").modal("show"); // show modal

        },
        showSetupEarlyBirdModalV(){
            this.updatePromotionObj= JSON.parse(JSON.stringify(this.promotion));

            $("#setupEarlyBirdModal").modal("show"); // show modal
        },
        showSetupRepurchaseModalV(){
            this.updatePromotionObj= JSON.parse(JSON.stringify(this.promotion));

            $("#setupRepurchaseModal").modal("show"); // show modal

        },
        loadBrandPromotionInfoV(){
            loadBrandPromotionInfo().then(response=>{
                if(response.data.code == 200){
                    this.promotion = !response.data.promotion ? {} : response.data.promotion ;
                    this.init_finish=true;
                }
            })
        },
        initPromotionInfoV(){
            initPromotionInfo();
        },
        isEmptyObjectV(obj){
            return $.isEmptyObject(obj);
        },
        refreshPromotionSetupV(){
            modifyPromotionInfo(this.updatePromotionObj);
        },
        transformInputNumberAsPositiveV(event){
            return transformInputNumberAsPositive(event);
        },
        validatePromotionSetupV(){
            const checkedEmpty=!!this.updatePromotionObj.creditPoint &&  !!this.updatePromotionObj.repurchaseDiscount && !!this.updatePromotionObj.earlyBirdDiscount;
            const checkedCreditPointNotChange=(this.updatePromotionObj.creditPoint==this.promotion.creditPoint) && (this.updatePromotionObj.creditPointTag==this.promotion.creditPointTag);
            const checkedEarlyBirdNotChange=(this.updatePromotionObj.earlyBirdDiscount==this.promotion.earlyBirdDiscount) && (this.updatePromotionObj.earlyBirdDiscountTag==this.promotion.earlyBirdDiscountTag);
            const checkedRepurchaseNotChange=(this.updatePromotionObj.repurchaseDiscount==this.promotion.repurchaseDiscount) && (this.updatePromotionObj.repurchaseDiscountTag==this.promotion.repurchaseDiscountTag);
            return checkedEmpty && (!checkedCreditPointNotChange || !checkedEarlyBirdNotChange || !checkedRepurchaseNotChange);

        }

    },
    created() {
        this.loadBrandPromotionInfoV();
    }
}
const app = createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : false,
    scene: EventFeedScene.STUDIO}));
app.mixin(ImageAdaptiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('content')
}
app.mixin(new FriendListCompoent({need_init: true}));
app.mixin(DirectiveComponent);
app.mixin(
    new Ssecompoent({
        sslSetting:{
            need_init: true,
            onMessage: (e)=>{
                promotionPage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);
const promotionPage = app.mount('#app');
window.cPromotionPage = promotionPage;

$(function(){
	$(".tooltip-nav").tooltip();
});

async function fetchBrandPromotionInfo(){
    const url="/api/v1/web_estudio/brand/promotion";
    return await axios.get(url); 
}


async function updatePromotionSetup(dto){
    const url="/api/v1/web_estudio/brand/modify_promotion";
    return await axios.put(url,dto);

}
async function activatePromotionFeature(){
    const url="/api/v1/web_estudio/brand/init_promotion";
    return await axios.post(url);
}
async function loadBrandPromotionInfo(){
    return fetchBrandPromotionInfo();
}
async function modifyPromotionInfo(updatePromotionObj){

    updatePromotionSetup(updatePromotionObj).then(response=>{

        if(response.data.code == 200){
            $("#setupCreditPointModal").modal("hide"); 
            $("#setupEarlyBirdModal").modal("hide"); 
            $("#setupRepurchaseModal").modal("hide");
            promotionPage.loadBrandPromotionInfoV();
        }
    }).catch(error=>{
        customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
    });
}

async function initPromotionInfo(){
    activatePromotionFeature().then(response=>{
        if(response.data.code == 200){
            promotionPage.loadBrandPromotionInfoV();
        }
    }).catch(error=>{
        customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
    });
}