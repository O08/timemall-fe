import "/common/javascripts/import-jquery.js";
import axios from 'axios';
import { createApp } from "vue";
import Pagination  from "/common/javascripts/pagination-vue.js";
import Auth from "/estudio/javascripts/auth.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";

import {EventFeedScene} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 

import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";

import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';

let customAlert = new CustomAlertModal();

const BlvRedeemCodesRewardTypeEnum = Object.freeze({
    "ONE_MONTH_VIP": "one_month_vip",
    "GIFT_POINTS": "gift_points"
});

const RootComponent = {
    data() {
        return {
            giftCode: "",
            giftList_pagination: {
                url: "/api/v1/marketing/redeem/history",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                paging: {},
                param: {},
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.giftList_pagination.size = response.redeemHistory.size;
                        this.giftList_pagination.current = response.redeemHistory.current;
                        this.giftList_pagination.total = response.redeemHistory.total;
                        this.giftList_pagination.pages = response.redeemHistory.pages;
                        this.giftList_pagination.records = response.redeemHistory.records;
                        this.giftList_pagination.paging = this.doPaging({current: response.redeemHistory.current, pages: response.redeemHistory.pages, size: 5});
        
                    }
                }
            },
        }
    },
    methods: {
        claimRedeemGiftV(){
          if(!this.giftCode) {
            customAlert.alert("请输入礼品码")
            return;
          }
          claimRedeemGift(this.giftCode).then(response=>{
            if(response.data.code==200){
              this.giftCode="";
              this.reloadPage(this.giftList_pagination);
              customAlert.alert("沃喔，礼包领取成功~");
            }
            if(response.data.code!=200){
                const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                customAlert.alert(error);
            }
          }).catch(error=>{
            customAlert.alert("操作失败，请检查网络或联系技术支持");
          });
        },
        explainRewardTypeV(type){
            var typeDesc="未知";
            switch(type){
              case BlvRedeemCodesRewardTypeEnum.ONE_MONTH_VIP:
                typeDesc="一个月会员"
                  break;
              case BlvRedeemCodesRewardTypeEnum.GIFT_POINTS:
                typeDesc="永久源能（点券）"
                  break;
            }
            return typeDesc;
        }
    }

}
const app = createApp(RootComponent);
app.mixin(Pagination);
app.mixin(new Auth({need_permission : true}));
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : true,
    scene: EventFeedScene.POD}));
app.mixin(ImageAdaptiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('content')
}
app.mixin(new FriendListCompoent({need_init: true}));

app.mixin(
    new Ssecompoent({
        sslSetting:{
            need_init: true,
            onMessage: (e)=>{
                giftHistoryPage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);
app.mixin(DirectiveComponent);
const giftHistoryPage = app.mount('#app');
window.pGiftHistoryPage= giftHistoryPage;

// init
giftHistoryPage.pageInit(giftHistoryPage.giftList_pagination);

async function doClaimGift(dto){
    const url = "/api/v1/marketing/redeem/claim";
    return await axios.post(url,dto);
}

async function claimRedeemGift(code){
  const dto={
    giftCode: code
  }
  return await doClaimGift(dto);
}



 // Enable popovers 
 $('[data-bs-toggle="popover"]').popover();

 $(function(){
	$(".tooltip-nav").tooltip();
});