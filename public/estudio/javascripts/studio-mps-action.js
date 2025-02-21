import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js";
import axios from 'axios';
import { getQueryVariable } from "/common/javascripts/util.js";


import {EventFeedScene} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import  MpsPaperChatCompoent from "/estudio/javascripts/compoent/MpsPaperChatCompoent.js";
import MpsPaperManagementCompoent from "/estudio/javascripts/compoent/MpsPaperManagementCompoent.js";
import MpsPaperDeliverCompoent from "/estudio/javascripts/compoent/MpsPaperDeliverCompoent.js";
import RtmCompoent from "/estudio/javascripts/compoent/rtm.js";
import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";
import { transformInputNumberAsPositive } from "/common/javascripts/util.js";

const RootComponent = {
    data() {
        return {
            mpmc__paperList: {}
        }
    },
    methods:{
        findAllMpsPaperV(){
            findAllMpsPaper().then(response=>{
                if(response.data.code==200){
                    this.mpmc__paperList=response.data.paper;
                    this.fetchHaveNewMpsMsgRoomV(); // mps paper chat compoent.js
                    this.joinMpsRoomsV(); // mps paper chat compoent.js
                }
            })
        },
        isEmptyObjectV(obj){
            return $.isEmptyObject(obj);
        },
        transformInputNumberV(event){
            return  transformInputNumberAsPositive(event);
        }
    },
    created(){
        this.findAllMpsPaperV();
    }
}
const app = createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : false,
    scene: EventFeedScene.STUDIO}));
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);
app.mixin(MpsPaperChatCompoent);
app.mixin(MpsPaperManagementCompoent);
app.mixin(MpsPaperDeliverCompoent);
app.mixin(RtmCompoent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('content')
}    
app.mixin(new FriendListCompoent({need_init: true}));

app.mixin(
    new Ssecompoent({
        sslSetting:{
            need_init: true,
            onMessage: (e)=>{
                mpsActionPage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);
const mpsActionPage = app.mount('#app');
window.cMpsActionPage = mpsActionPage;
mpsActionPage.joinRoomInitV(); // rtm.js
async function fetchAllMpsPaperOwnedMps(mpsId){
    const url ="/api/v1/web_estudio/mps/paper?mpsId="+mpsId;
    return await axios.get(url);
}

function findAllMpsPaper(){
    const mpsId=getQueryVariable("mps_id");
    return fetchAllMpsPaperOwnedMps(mpsId);
}



  $(function(){
	$(".tooltip-nav").tooltip();
});
