import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"
import OasisAnnounceComponent from "/rainbow/javascripts/compoent/OasisAnnounceComponent.js"

import TeicallaanliSubNavComponent from "/rainbow/javascripts/compoent/TeicallaanliSubNavComponent.js"

import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import { getQueryVariable } from "/common/javascripts/util.js";

import  OasisApi from "/rainbow/javascripts/oasis/OasisApi.js";
import {OasisOptionCtlComponent} from '/rainbow/oasis/javascripts/oasis-option-ctl-component.js'; 
import {OasisFastLinkComponent} from '/rainbow/oasis/javascripts/oasis-fast-link-component.js'; 
import axios from "axios";

import { getDayName } from "/common/javascripts/util.js";


import { CustomAlertModal } from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const currentOasisId = getQueryVariable("oasis_id");
const currentOch=getQueryVariable('och');

const {channelSort, oaisiChannelList ,getChannelDataV} =  OasisApi.fetchchannelList(currentOasisId);



const RootComponent = {
    components: {
        oasisoptions: OasisOptionCtlComponent,fastlinks: OasisFastLinkComponent
    },
    data() {


      return {
        init_finish: false,
        currentCardType: "monthly",
        currentOasisId,
        currentOch,
        channelSort: channelSort, oaisiChannelList: oaisiChannelList,getChannelDataV: getChannelDataV,
        appViewUrl: "",
        tier: [],
        newOrderObj:{
            tierId: "",
            cardType: ""
        },
        focusModal:{
            feed: "",
            confirmHandler:()=>{

            }
        }
      }
    },
    methods: {
        handleJoinSuccessEventV(){
            this.loadJoinedOases(); // sub nav component.js
        },
        handleUnfollowSuccessEventV(){
            this.loadJoinedOases(); // sub nav component.js
        },
        loadMembershipTeirInfoV(){
            loadMembershipTeirInfo(currentOasisId).then(response=>{
                if(response.data.code == 200){
                    
                    this.tier=response.data.tier;
                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error); 
                }
                this.init_finish=true;
            });
        },
        showOrderTierFocusModalV(tier){
            this.focusModal.feed=tier.tierName  + "，有效期："+ (this.currentCardType=="monthly" ? "一个月" : "一年");
            this.focusModal.confirmHandler=()=>{
                this.newOrderObj.tierId=tier.tierId;
                this.newOrderObj.cardType=this.currentCardType;
                this.subscribeNowV();
            };
            $("#focusModal").modal("show"); // show modal
        },
        closeOrderTierFocusModalV(){
            $("#focusModal").modal("hide");
        },
        subscribeNowV(){
            subscribeTier(this.newOrderObj).then(response=>{
                if(response.data.code == 200){
                    this.loadMembershipTeirInfoV();
                    this.refreshChannelListV();
                    this.closeOrderTierFocusModalV();
                }
                if(response.data.code==40007){
                    customAlert.alert("余额不足"); 
                    return ;
                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error); 
                }
        
            });
        },
        calTotalV(price){
            const cycle=this.currentCardType=='monthly'? 1 : 12;
            return (Number(price) * cycle).toFixed(2).toString().replace(".00","");
        },
        tierInActiveV(tier){
            if(!tier || !tier.endAt){
                return false;
            }
            return new Date()<new Date(tier.endAt);
        },
        getDayNameV(dateStr){
            return getDayName(dateStr);
        },
        refreshChannelListV(){
            const {channelSort, oaisiChannelList ,getChannelDataV} =  OasisApi.fetchchannelList(currentOasisId);
            this.channelSort=channelSort;
            this.oaisiChannelList=oaisiChannelList,
            this.getChannelDataV=getChannelDataV;
        }
        
    },
    updated(){
        
        $(function () {
            $('[data-popper-reference-hidden]').remove();
            $('.popover.custom-popover.bs-popover-auto.fade.show').remove();
            // Enable popovers 
            $('[data-bs-toggle="popover"]').popover();
        });
    
    }
}


let app =  createApp(RootComponent);
app.mixin(new Auth({need_permission : true,need_init: false}));
app.mixin(OasisAnnounceComponent);
app.mixin(TeicallaanliSubNavComponent);
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);


app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('col-') || tag.startsWith('top-')
}

const membershipPage = app.mount('#app');

window.oasisMembershipPage = membershipPage;

membershipPage.userAdapter(); // auth.js init
membershipPage.loadAnnounceV(); // oasis announce component .js init
membershipPage.loadSubNav() // sub nav component .js init 
membershipPage.loadFastLink() // announce  component .js init 
membershipPage.loadMembershipTeirInfoV();

async function fetchMembershipTeirInfo(oasisId){
    const url="/api/v1/team/membership/selling_tier/query?oasisId="+oasisId;
    return await axios.get(url);
}

async function doBuyTier(order){
    const url="/api/v1/team/membership/selling_tier/buy";
    return await axios.post(url,order);
}
async function subscribeTier(order){
    return await doBuyTier(order);
 }

async function loadMembershipTeirInfo(oasisId){
    return fetchMembershipTeirInfo(oasisId);
}



