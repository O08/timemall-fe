import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import { getQueryVariable } from "/common/javascripts/util.js";
import Auth from "/estudio/javascripts/auth.js"
import axios from 'axios';



const RootComponent = {
    data() {
        return {
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
        }
    },
    created() {

    }
}
const app = createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
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
    saveWorkflow(id);
}


