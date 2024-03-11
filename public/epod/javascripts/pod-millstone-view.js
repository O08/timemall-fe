import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import { getQueryVariable } from "/common/javascripts/util.js";
import Auth from "/estudio/javascripts/auth.js"
import axios from 'axios';
import defaultAvatarImage from '/avator.webp'
import { DirectiveComponent,autoHeight } from "/common/javascripts/custom-directives.js";

import BrandInfoComponent from "/estudio/javascripts/load-brandinfo.js";
import  MillstoneChatCompoent from "/estudio/javascripts/compoent/MillstoneChatCompoent.js";
import RtmCompoent from "/estudio/javascripts/compoent/rtm.js";
import {EventFeedScene} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 


const RootComponent = {
    data() {
        return {
            defaultAvatarImage,
            workflow: {
                serviceInfo: {}
            }
        }
    },
    methods: {
        loadWorkflowInfoV(){
            loadWorkflowInfo();
        }
    }
}
const app = createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(DirectiveComponent);

app.mixin(BrandInfoComponent);
app.mixin(MillstoneChatCompoent);
app.mixin(RtmCompoent);
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : false,
    scene: EventFeedScene.POD}));
app.mixin(ImageAdaptiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('content')
}

const millstoneViewPage = app.mount('#app');
window.pMillstoneView= millstoneViewPage;

async function getSingleWorkflow(workflowId){
    const url = "/api/v1/web_epod/millstone/workflow/{workflow_id}".replace("{workflow_id}",workflowId);
    
    return await axios.get(url);
}

function loadWorkflowInfo(){
    const workflowId = getQueryVariable("workflow_id"); 
    getSingleWorkflow(workflowId).then(response=>{
        if(response.data.code==200){
            millstoneViewPage.workflow = response.data.workflow;
        }
    });
}

// init 
millstoneViewPage.loadWorkflowInfoV();

