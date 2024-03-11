import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import { getQueryVariable } from "/common/javascripts/util.js";
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'
import Auth from "/estudio/javascripts/auth.js"

import BrandInfoComponent from "/estudio/javascripts/load-brandinfo.js";

import {WorkflowStatus,EventFeedScene} from "/common/javascripts/tm-constant.js";
import axios from 'axios';
import defaultAvatarImage from '/avator.webp';
import  MillstoneChatCompoent from "/estudio/javascripts/compoent/MillstoneChatCompoent.js";
import RtmCompoent from "/estudio/javascripts/compoent/rtm.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js"
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
        },
        approvedWorkflowV(){
            approvedWorkflow();
        },
        rejectWorkflowV(){
            rejectWorkflow();
        }
    },
    created() {

    }
}
const app = createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(BrandInfoComponent);
app.mixin(MillstoneChatCompoent);
app.mixin(RtmCompoent);
app.mixin(DirectiveComponent);
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : false,
    scene: EventFeedScene.STUDIO}));
app.mixin(ImageAdaptiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('content')
}

const millstoneAuditPage = app.mount('#app');
window.cMillstoneAudit= millstoneAuditPage;

async function getSingleWorkflow(workflowId){
    const url = "/api/v1/web_epod/millstone/workflow/{workflow_id}".replace("{workflow_id}",workflowId);
    return axios.get(url);
}

async function markMillstone(workflowId,code){
    var url = "/api/v1/web_estudio/millstone/workflow/{workflow_id}/mark".replace("{workflow_id}",workflowId);
    url= url + "?code=" + code
    return axios.put(url);
}

function loadWorkflowInfo(){
    const workflowId = getQueryVariable("workflow_id"); // todo 
    getSingleWorkflow(workflowId).then(response=>{
        if(response.data.code == 200){
            millstoneAuditPage.workflow = response.data.workflow;
         }
    });
}

function approvedWorkflow(){
    const workflowId = getQueryVariable("workflow_id"); // todo 
    markMillstone(workflowId,WorkflowStatus.Audited).then(response=>{
        if(response.data.code == 200){
            goViewOption();
        }
    });
}
function rejectWorkflow(){
    const workflowId = getQueryVariable("workflow_id"); // todo 
    markMillstone(workflowId,WorkflowStatus.InQueue).then(response=>{
        if(response.data.code == 200){
            goViewOption();
        }
    });
}


// init 

millstoneAuditPage.loadWorkflowInfoV();



function optionSetting(){
    const option = getQueryVariable("option");
    if(option==="audit"){
        $("#section-fly-tool").show();
    }
}
optionSetting();

function goViewOption(){
    const id = getQueryVariable("workflow_id");
    if(id){
        let url = "/estudio/studio-millstone-action.html?option=view&workflow_id="+ id;
        history.pushState(null, "", url);
        $("#section-fly-tool").hide();
    }
}

// Enable popovers 

const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl))