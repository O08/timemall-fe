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
import  MpsPaperChatCompoent from "/estudio/javascripts/compoent/MpsPaperChatCompoent.js";
import MpsPaperManagementCompoent from "/estudio/javascripts/compoent/MpsPaperManagementCompoent.js";
import MpsPaperDeliverCompoent from "/estudio/javascripts/compoent/MpsPaperDeliverCompoent.js";
import RtmCompoent from "/estudio/javascripts/compoent/rtm.js";


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
            var val = Number(event.target.value.replace(/^(0+)|[^\d]+/g,''));// type int
            var min = Number(event.target.min);
            var max = Number(event.target.max);
            event.target.value = transformInputNumber(val, min, max);
            if(val !== Number(event.target.value)){
              event.currentTarget.dispatchEvent(new Event('input')); // update v-model
            }
        }
    },
    created(){
        this.findAllMpsPaperV();
    }
}
const app = createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(BrandInfoComponent);
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

const mpsActionPage = app.mount('#app');
window.cMpsActionPage = mpsActionPage;

async function fetchAllMpsPaperOwnedMps(mpsId){
    const url ="/api/v1/web_estudio/mps/paper?mpsId="+mpsId;
    return await axios.get(url);
}

function findAllMpsPaper(){
    const mpsId=getQueryVariable("mps_id");
    return fetchAllMpsPaperOwnedMps(mpsId);
}
function transformInputNumber(val,min,max){
    return val < min ? "" : val > max ? max : val;
  }
