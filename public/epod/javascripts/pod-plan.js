import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js";
import axios from 'axios';
import { getQueryVariable } from "/common/javascripts/util.js";


import BrandInfoComponent from "/estudio/javascripts/load-brandinfo.js";
import {EventFeedScene} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import  CellPlanOrderChatCompoent from "/estudio/javascripts/compoent/CellPlanOrderChatCompoent.js";
import CellPlanOrderDeliverCompoent from "/estudio/javascripts/compoent/CellPlanOrderDeliverCompoent.js";
import RtmCompoent from "/estudio/javascripts/compoent/rtm.js";
import {CodeExplainComponent} from "/common/javascripts/compoent/code-explain-compoent.js";
import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";

const RootComponent = {
    data() {
        return {
            orderDetail:{

            }
        }
    },
    methods:{
        findPlanDetailV(){
            findPlanDetail().then(response=>{
                if(response.data.code==200){
                    this.orderDetail=response.data.order;
                    // this.fetchHaveNewMpsMsgRoomV();
                    // this.joinMpsRoomsV();
                }
            });
        },
        isEmptyObjectV(obj){
            return $.isEmptyObject(obj);
        }
    },
    created(){
        this.findPlanDetailV();
        this.fetchPaperDeliverDetailV();
    },
    updated(){
        if(document.getElementById("event-tab").ariaSelected=='true'){
            document.querySelector('.room-msg-container').scrollTop = document.querySelector('.room-msg-container').scrollHeight;
        }
    }
}
const app = createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(new BrandInfoComponent({need_init: true}));
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : false,
    scene: EventFeedScene.POD}));
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);
app.mixin(CellPlanOrderChatCompoent);
app.mixin(CellPlanOrderDeliverCompoent);
app.mixin(RtmCompoent);
app.mixin(CodeExplainComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('content')
}   
app.mixin(new FriendListCompoent({need_init: true}));

app.mixin(
    new Ssecompoent({
        sslSetting:{
            need_init: true,
            onMessage: (e)=>{
                podPlanPage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);
const podPlanPage = app.mount('#app');
window.cPodPlanPage = podPlanPage;

async function fetchPlanDetail(planOrderId){
    const url="/api/v1/web_estudio/cell/plan_order/{id}".replace("{id}",planOrderId);
    return await axios.get(url);
}

function findPlanDetail(){
    const orderId=getQueryVariable("id");
    return fetchPlanDetail(orderId);
}


$(function(){
	$(".tooltip-nav").tooltip();
});