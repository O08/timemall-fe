import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import { getQueryVariable } from "/common/javascripts/util.js";
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'
import Auth from "/estudio/javascripts/auth.js"



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
const millstoneAuditPage = app.mount('#app');
window.cMillstoneAudit= millstoneAuditPage;

function getSingleWorkflow(workflowId){
    const url = "/api/v1/web_epod/millstone/workflow/{workflow_id}".replace("{workflow_id}",workflowId);
    $.get(url,function(data) {
        if(data.code == 200){
            millstoneAuditPage.workflow = data.workflow;
        }
       })
         .fail(function(data) {
           // place error code here
         });
}

function markMillstone(workflowId,code){
    var url = "/api/v1/web_estudio/millstone/workflow/{workflow_id}/mark".replace("{workflow_id}",workflowId);
    url= url + "?code=" + code
     
    $.ajax({
        url: url,
        type: "put",
        dataType:"json",
        success:function(data){
            // todo 
            if(data.code == 200){
            
            }
        },
        error:function(){
            //alert('error'); //错误的处理
        }
    });  
}

function loadWorkflowInfo(){
    const workflowId = getQueryVariable("workflow_id"); // todo 
    getSingleWorkflow(workflowId);
    // mockWorkflowInfo();
}

function approvedWorkflow(){
    const workflowId = getQueryVariable("workflow_id"); // todo 
    markMillstone(workflowId,"1");
}
function rejectWorkflow(){
    const workflowId = getQueryVariable("workflow_id"); // todo 
    markMillstone(workflowId,"2");
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

// Enable popovers 

const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl))