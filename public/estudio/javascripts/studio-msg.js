import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"


import {EventFeedScene} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";
const RootComponent = {
    data() {
        return {
        }
    },
    methods: {

        explainMsgTypeV(biz){
            if(biz=='mps_to_supplier') return "商单采购商消息";
            if(biz=='mps_to_purchaser') return "商单服务商消息";
            if(biz=='millstone') return "特约消息";
            if(biz=='plan') return "单品消息";
            return "未知业务";
        },
        generateLinkV(feed){
            if(feed.biz=="millstone") return "/estudio/gig-order-deliver?option=view&workflow_id=" + feed.workFlowId;
            if(feed.biz=="mps_to_purchaser") return "/estudio/studio-mps-action?id=" + feed.workFlowId;
            if(feed.biz=="mps_to_supplier") return "/estudio/b2b-order-deliver?paper_id=" + feed.workFlowId;
            if(feed.biz=="plan") return "/estudio/packages-order-deliver?id=" + feed.workFlowId;
        }
         
    }
}
const app = createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : true,
    scene: EventFeedScene.STUDIO}));
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
                msgPage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);
const msgPage = app.mount('#app');
window.cMsg= msgPage;


$(function(){
	$(".tooltip-nav").tooltip();
});