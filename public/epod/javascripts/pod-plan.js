import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
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
    }
}
const app = createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(BrandInfoComponent);
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


