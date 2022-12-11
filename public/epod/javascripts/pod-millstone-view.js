import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import { getQueryVariable } from "/common/javascripts/util.js";
import Auth from "/estudio/javascripts/auth.js"
import axios from 'axios';


const RootComponent = {
    data() {
        return {
            workflow: {
                serviceInfo: {}
            }
        }
    },
    methods: {
        loadWorkflowInfoV(){
            loadWorkflowInfo();
        }
    },
    created() {

    }
}
const app = createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
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

