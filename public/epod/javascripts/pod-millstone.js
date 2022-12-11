import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import Pagination  from "/common/javascripts/pagination-vue.js";
import { getQueryVariable } from "/common/javascripts/util.js";
import Auth from "/estudio/javascripts/auth.js"
import axios from 'axios';

var WorkflowStatus = Object.freeze({
    "InQueue":1, // 队列中
    "Starred":2 // 已定稿
});

const RootComponent = {
    data() {
        return {
            transpagination:{
                url: "/api/v1/web_epod/me/millstone/workflow",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                    code: WorkflowStatus.InQueue
                },
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.transpagination.size = response.workflows.size;
                        this.transpagination.current = response.workflows.current;
                        this.transpagination.total = response.workflows.total;
                        this.transpagination.pages = response.workflows.pages;
                        this.transpagination.records = response.workflows.records;
                    }
                }
            },
            starredTranspagination:{
                url: "/api/v1/web_epod/me/millstone/workflow",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                    code: WorkflowStatus.Starred
                },
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.starredTranspagination.size = response.workflows.size;
                        this.starredTranspagination.current = response.workflows.current;
                        this.starredTranspagination.total = response.workflows.total;
                        this.starredTranspagination.pages = response.workflows.pages;
                        this.starredTranspagination.records = response.workflows.records;
                    }
                }
            }
        }
    },
    methods: {
        finishMillstoneV(workflowId){
            finishMillstone(workflowId);
        },
        reloadTable(){
            this.reloadPage(this.transpagination);
            this.reloadPage(this.starredTranspagination);
        }
    },
    created() {
        // todo url replace {brand_id}
        this.pageInit(this.transpagination);
        this.pageInit(this.starredTranspagination);
    },
    updated(){
        $(function() {
            // Remove already delete element popover ,maybe is bug
            $('[data-popper-reference-hidden]').remove();
            // Enable popovers 
            $('[data-bs-toggle="popover"]').popover();
        });
    }

}
const app = createApp(RootComponent);
app.mixin(Pagination);
app.mixin(new Auth({need_permission : true}));
const millStonePage = app.mount('#app');
window.pMillstone= millStonePage;

async function markMillstone(workflowId){
    const url = "/api/v1/web_epod/millstone/workflow/{workflow_id}/mark".replace("{workflow_id}",workflowId) + "?code=" + WorkflowStatus.Starred;
    return await axios.put(url);
}

function finishMillstone(workflowId){
    markMillstone(workflowId).then(response=>{
       if(response.data.code==200){
         millStonePage.reloadTable();
       }
    });
}

function showTabContent(){
    const option = getQueryVariable("option");
    if(option === "starred"){
        $("#starred-tab").trigger("click");
    }
}

showTabContent();

