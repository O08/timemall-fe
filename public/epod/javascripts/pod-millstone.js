import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import Pagination  from "/common/javascripts/pagination-vue.js";
import { getQueryVariable } from "/common/javascripts/util.js";
import Auth from "/estudio/javascripts/auth.js"
import axios from 'axios';

var WorkflowStatus = Object.freeze({
    "InQueue": 1, // 队列中
    "Auditing": 2, // 审计中
    "Audited": 3, // 审计完成
    "Starred": 4, // 已定稿，履约中
    "Suspend": 5, // 中止
    "Paused": 6, // 停止
    "Finish": 7 // 已经完成
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
            auditing_pagination:{
                url: "/api/v1/web_epod/me/millstone/workflow",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                    code: WorkflowStatus.Auditing
                },
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.auditing_pagination.size = response.workflows.size;
                        this.auditing_pagination.current = response.workflows.current;
                        this.auditing_pagination.total = response.workflows.total;
                        this.auditing_pagination.pages = response.workflows.pages;
                        this.auditing_pagination.records = response.workflows.records;
                    }
                }
            },
            confirm_pagination:{
                url: "/api/v1/web_epod/me/millstone/workflow",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                    code: WorkflowStatus.Audited
                },
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.confirm_pagination.size = response.workflows.size;
                        this.confirm_pagination.current = response.workflows.current;
                        this.confirm_pagination.total = response.workflows.total;
                        this.confirm_pagination.pages = response.workflows.pages;
                        this.confirm_pagination.records = response.workflows.records;
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
            },
            paused_pagination:{
                url: "/api/v1/web_epod/me/millstone/workflow",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                    code: WorkflowStatus.Paused
                },
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.paused_pagination.size = response.workflows.size;
                        this.paused_pagination.current = response.workflows.current;
                        this.paused_pagination.total = response.workflows.total;
                        this.paused_pagination.pages = response.workflows.pages;
                        this.paused_pagination.records = response.workflows.records;
                    }
                }
            },
            suspend_pagination:{
                url: "/api/v1/web_epod/me/millstone/workflow",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                    code: WorkflowStatus.Suspend
                },
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.suspend_pagination.size = response.workflows.size;
                        this.suspend_pagination.current = response.workflows.current;
                        this.suspend_pagination.total = response.workflows.total;
                        this.suspend_pagination.pages = response.workflows.pages;
                        this.suspend_pagination.records = response.workflows.records;
                    }
                }
            },
            finish_pagination:{
                url: "/api/v1/web_epod/me/millstone/workflow",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                    code: WorkflowStatus.Finish
                },
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.finish_pagination.size = response.workflows.size;
                        this.finish_pagination.current = response.workflows.current;
                        this.finish_pagination.total = response.workflows.total;
                        this.finish_pagination.pages = response.workflows.pages;
                        this.finish_pagination.records = response.workflows.records;
                    }
                }
            }
        }
    },
    methods: {
        confirmMillstoneV(workflowId){
            confirmMillstone(workflowId);
        },
        goAuditV(workflowId){
            goAudit(workflowId);
        },
        pausedTaskV(workflowId){
            changeMarkForTask(workflowId,WorkflowStatus.Paused);
        },
        suspendTaskV(workflowId){
            changeMarkForTask(workflowId, WorkflowStatus.Suspend);
        },
        finishTaskV(workflowId){
            changeMarkForTask(workflowId,WorkflowStatus.Finish);
        },
        resumeTaskV(workflowId){
            resumeTask(workflowId);
        },
        reloadTableWhenConfirmMillstone(){
            this.reloadPage(this.confirm_pagination);
            this.reloadPage(this.starredTranspagination);
        },
        reloadTableWhenGoAudit(){
            this.reloadPage(this.transpagination);
            this.reloadPage(this.auditing_pagination);
        }
    },
    created() {
        // todo url replace {brand_id}
        this.pageInit(this.transpagination);
        this.pageInit(this.starredTranspagination);
        this.pageInit(this.confirm_pagination);
        this.pageInit(this.suspend_pagination);
        this.pageInit(this.paused_pagination);
        this.pageInit(this.finish_pagination);
        this.pageInit(this.auditing_pagination);
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

async function markMillstone(workflowId,code){
    const url = "/api/v1/web_epod/millstone/workflow/{workflow_id}/mark".replace("{workflow_id}",workflowId) + "?code=" + code;
    return await axios.put(url);
}
// 定稿
function confirmMillstone(workflowId){
    markMillstone(workflowId,WorkflowStatus.Starred).then(response=>{
       if(response.data.code==200){
         millStonePage.reloadTableWhenConfirmMillstone();
       }
    });
}
// 流转到服务商进行审计
function goAudit(workflowId){
    markMillstone(workflowId,WorkflowStatus.Auditing).then(response=>{
        if(response.data.code==200){
          millStonePage.reloadTableWhenGoAudit();
        }
     });
}
// 任务箱任务流流转
function changeMarkForTask(workflowId,code){
    markMillstone(workflowId,code).then(response=>{
        if(response.data.code==200){
            // 刷新任务箱
          millStonePage.reloadPage(millStonePage.starredTranspagination);
          switch(code){
            case WorkflowStatus.Paused:
                millStonePage.reloadPage(millStonePage.paused_pagination);
                break;
            case WorkflowStatus.Suspend:
                millStonePage.reloadPage(millStonePage.suspend_pagination);
                break;
            case WorkflowStatus.Finish:
                millStonePage.reloadPage(millStonePage.finish_pagination);
                break;
          }
        }
     });
}
// 恢复暂停任务
function resumeTask(workflowId){

    markMillstone(workflowId,WorkflowStatus.Starred).then(response=>{
        if(response.data.code==200){
            // 刷新任务箱、暂停列表
          millStonePage.reloadPage(millStonePage.starredTranspagination);
          millStonePage.reloadPage(millStonePage.paused_pagination);

        }
     });
}
function showTabContent(){
    const option = getQueryVariable("tab");
    switch(option){
        case "auditing":
            $("#auditing-tab").trigger("click");
                break; 
        case "confirm":
            $("#confirm-tab").trigger("click");
                break; 
        case "task":
            $("#task-tab").trigger("click");
                break; 
        case "paused":
            $("#paused-tab").trigger("click");
            break; 
        case "suspend":
            $("#suspend-tab").trigger("click");
                break; 
        case "finish":
            $("#finish-tab").trigger("click");
            break; 
    }
}

showTabContent();

