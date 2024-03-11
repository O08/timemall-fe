import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import { getQueryVariable } from "/common/javascripts/util.js";
import Auth from "/estudio/javascripts/auth.js"
import axios from 'axios';
import { DirectiveComponent,autoHeight } from "/common/javascripts/custom-directives.js";
import 'jquery-ui/ui/widgets/datepicker.js';
import 'jquery-ui/ui/i18n/datepicker-zh-CN.js';
import BrandInfoComponent from "/estudio/javascripts/load-brandinfo.js";
import  MillstoneChatCompoent from "/estudio/javascripts/compoent/MillstoneChatCompoent.js";
import RtmCompoent from "/estudio/javascripts/compoent/rtm.js";
import {EventFeedScene} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 

const RootComponent = {
    data() {
      
        return {
            a: "",
            // defaultAvatarImage,
            btn_ctl:{
                activate_general_save_btn: false
            },
            workflow: {
                millstones: [],
                serviceInfo: {}
            }
        }
    },
    methods: {
         newMillstoneV(){
           const m = this.emptyMillstone();
           this.workflow.millstones.unshift(m)
         },
         removeMillstoneV(mIndex){
            this.workflow.millstones.splice(mIndex,1);
         },
         newObjV(mIndex){
            this.workflow.millstones[mIndex].objective.unshift({});
         },
         removeObjV(mIndex,objIndex){
            this.workflow.millstones[mIndex].objective.splice(objIndex,1);
         },
         newMetric(mIndex){
            this.workflow.millstones[mIndex].metric.unshift({});
         },
         removeMetric(mIndex,metricIndex){
            this.workflow.millstones[mIndex].metric.splice(metricIndex,1);
         },
         replaceWorkflowV(){
            replaceWorkflow();
         },
         emptyMillstone(){
            return {
                objective: [{}],
                metric: [{}]
            }
         },
         loadWorkflowInfoV(){
            loadWorkflowInfo();
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
    updated(){

          // init auto height for textarea
          [...$("textarea")].forEach(el=>{ 
            if(el.id === 'twemoji-picker'){ // exclude emoji picker 
                console.log("emoji picker");
            }else{
                autoHeight(el);
            }
        })
        $(function() {
            // Remove already delete element popover ,maybe is bug
            $('[data-popper-reference-hidden]').remove();
            $('.popover.custom-popover.bs-popover-auto.fade.show').remove();
            // Enable popovers 
            $('[data-bs-toggle="popover"]').popover();
        });

            $( ".datepicker" ).datepicker({
                dateFormat: "yy-mm-dd",
                duration: "fast",
                onSelect: function(selectedDate,inst) {
                    if(inst.lastVal !=selectedDate){
                        document.getElementById(inst.id).dispatchEvent(new Event('input'))
                        document.getElementById(inst.id).dispatchEvent(new Event('change'))
                    }
                }
            });
            $( ".datepicker" ).datepicker( $.datepicker.regional[ "zh-CN" ] );

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



const millstoneEditPage = app.mount('#app');
window.pMillstoneEdit= millstoneEditPage;


// init 
millstoneEditPage.loadWorkflowInfoV();

async function saveWorkflow(workflowId){
    const url = "/api/v1/web_epod/millstone/workflow/{workflow_id}".replace("{workflow_id}",workflowId);
    return axios.put(url,{workflow: millstoneEditPage.workflow});
}
async function getSingleWorkflow(workflowId){
    const url = "/api/v1/web_epod/millstone/workflow/{workflow_id}".replace("{workflow_id}",workflowId);
    return await axios.get(url);
}
function loadWorkflowInfo(){
    const workflowId = getQueryVariable("workflow_id"); 
    getSingleWorkflow(workflowId).then(response=>{
        if(response.data.code==200){
            millstoneEditPage.workflow = response.data.workflow;
            if(!millstoneEditPage.workflow.millstones){
                millstoneEditPage.workflow.millstones=[];
            }
        }
    });
}

function replaceWorkflow(){

    const id= getQueryVariable("workflow_id");// workflow id
    if(!id){
        return;
    }
    saveWorkflow(id).then(response=>{
        if(response.data.code==200){
            millstoneEditPage.btn_ctl.activate_general_save_btn = false;
        }
    });
}

// Enable popovers 
$('[data-bs-toggle="popover"]').popover();



function transformInputNumber(val,min,max){
    return val < min ? "" : val > max ? max : val;
  }

