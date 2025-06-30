import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Pagination  from "/common/javascripts/pagination-vue.js";
import Auth from "/estudio/javascripts/auth.js"
import axios from 'axios';
import {WorkflowStatus,EventFeedScene,PriceSbu} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import {CodeExplainComponent} from "/common/javascripts/compoent/code-explain-compoent.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";

import { getQueryVariable } from "/common/javascripts/util.js";


const RootComponent = {
    data() {
        return {
            current_tb: "trans",
            searchQ: "",
            transpagination:{
                url: "/api/v1/web_epod/me/millstone/workflow",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                    q:"",
                    code: WorkflowStatus.InQueue
                },
                paging: {},
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.transpagination.size = response.workflows.size;
                        this.transpagination.current = response.workflows.current;
                        this.transpagination.total = response.workflows.total;
                        this.transpagination.pages = response.workflows.pages;
                        this.transpagination.records = response.workflows.records;
                        this.transpagination.paging = this.doPaging({current: response.workflows.current, pages: response.workflows.pages, size: 5});

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
                    q:"",
                    code: WorkflowStatus.Auditing
                },
                paging: {},
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.auditing_pagination.size = response.workflows.size;
                        this.auditing_pagination.current = response.workflows.current;
                        this.auditing_pagination.total = response.workflows.total;
                        this.auditing_pagination.pages = response.workflows.pages;
                        this.auditing_pagination.records = response.workflows.records;
                        this.auditing_pagination.paging = this.doPaging({current: response.workflows.current, pages: response.workflows.pages, size: 5});

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
                    q:"",
                    code: WorkflowStatus.Audited
                },
                paging: {},
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.confirm_pagination.size = response.workflows.size;
                        this.confirm_pagination.current = response.workflows.current;
                        this.confirm_pagination.total = response.workflows.total;
                        this.confirm_pagination.pages = response.workflows.pages;
                        this.confirm_pagination.records = response.workflows.records;
                        this.confirm_pagination.paging = this.doPaging({current: response.workflows.current, pages: response.workflows.pages, size: 5});

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
                    q:"",
                    code: WorkflowStatus.Starred
                },
                paging: {},
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.starredTranspagination.size = response.workflows.size;
                        this.starredTranspagination.current = response.workflows.current;
                        this.starredTranspagination.total = response.workflows.total;
                        this.starredTranspagination.pages = response.workflows.pages;
                        this.starredTranspagination.records = response.workflows.records;
                        this.starredTranspagination.paging = this.doPaging({current: response.workflows.current, pages: response.workflows.pages, size: 5});

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
                    q:"",
                    code: WorkflowStatus.Paused
                },
                paging: {},
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.paused_pagination.size = response.workflows.size;
                        this.paused_pagination.current = response.workflows.current;
                        this.paused_pagination.total = response.workflows.total;
                        this.paused_pagination.pages = response.workflows.pages;
                        this.paused_pagination.records = response.workflows.records;
                        this.paused_pagination.paging = this.doPaging({current: response.workflows.current, pages: response.workflows.pages, size: 5});

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
                    q:"",
                    code: WorkflowStatus.Suspend
                },
                paging: {},
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.suspend_pagination.size = response.workflows.size;
                        this.suspend_pagination.current = response.workflows.current;
                        this.suspend_pagination.total = response.workflows.total;
                        this.suspend_pagination.pages = response.workflows.pages;
                        this.suspend_pagination.records = response.workflows.records;
                        this.suspend_pagination.paging = this.doPaging({current: response.workflows.current, pages: response.workflows.pages, size: 5});

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
                    q:"",
                    code: WorkflowStatus.Finish
                },
                paging: {},
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.finish_pagination.size = response.workflows.size;
                        this.finish_pagination.current = response.workflows.current;
                        this.finish_pagination.total = response.workflows.total;
                        this.finish_pagination.pages = response.workflows.pages;
                        this.finish_pagination.records = response.workflows.records;
                        this.finish_pagination.paging = this.doPaging({current: response.workflows.current, pages: response.workflows.pages, size: 5});

                    }
                }
            }

        }
    },
    methods: {
        searchOrderV(){
            if(this.current_tb=="trans"){
              this.transpagination.current = 1;
              this.transpagination.param.q=this.searchQ;
              this.reloadPage(this.transpagination);
            }
            if(this.current_tb=="auditing"){
              this.auditing_pagination.current = 1;
              this.auditing_pagination.param.q=this.searchQ;
              this.reloadPage(this.auditing_pagination);
            }
            if(this.current_tb=="confirm"){
              this.confirm_pagination.current = 1;
              this.confirm_pagination.param.q=this.searchQ;
              this.reloadPage(this.confirm_pagination);
            }
            if(this.current_tb=="starred"){
              this.starredTranspagination.current = 1;
              this.starredTranspagination.param.q=this.searchQ;
              this.reloadPage(this.starredTranspagination);
            }
            if(this.current_tb=="paused"){
              this.paused_pagination.current = 1;
              this.paused_pagination.param.q=this.searchQ;
              this.reloadPage(this.paused_pagination);
            }
            if(this.current_tb=="suspend"){
              this.suspend_pagination.current = 1;
              this.suspend_pagination.param.q=this.searchQ;
              this.reloadPage(this.suspend_pagination);
            }
            if(this.current_tb=="finish"){
              this.finish_pagination.current = 1;
              this.finish_pagination.param.q=this.searchQ;
              this.reloadPage(this.finish_pagination);
            }
         },
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
        },
        reloadTableWhenGoAudit(){
            this.reloadPage(this.transpagination);
        },
        refreshTranspaginationV(){
            this.current_tb="trans";
            this.searchQ="";
            this.transpagination.param.q="";
            document.querySelector("#bubble-tab li.pointer").style.left = "30px";
            this.transpagination.current = 1;
            this.reloadPage(this.transpagination);
        },
        refreshStarredTranspaginationV(){
            this.current_tb="starred";
            this.searchQ="";
            this.starredTranspagination.param.q="";
            document.querySelector("#bubble-tab li.pointer").style.left = "296px";
            this.starredTranspagination.current = 1;
            this.reloadPage(this.starredTranspagination);
        },
        refreshConfirmPaginationV(){
            this.current_tb="confirm";
            this.searchQ="";
            this.confirm_pagination.param.q="";
            document.querySelector("#bubble-tab li.pointer").style.left = "210px";
            this.confirm_pagination.current = 1;
            this.reloadPage(this.confirm_pagination);
        },
        refreshSuspendPaginationV(){
            this.current_tb="suspend";
            this.searchQ="";
            this.suspend_pagination.param.q="";
            document.querySelector("#bubble-tab li.pointer").style.left = "460px";
            this.suspend_pagination.current = 1;
            this.reloadPage(this.suspend_pagination);
        },
        refreshPausedPaginationV(){
            this.current_tb="paused";
            this.searchQ="";
            this.paused_pagination.param.q="";
            document.querySelector("#bubble-tab li.pointer").style.left = "378px";
            this.paused_pagination.current = 1;
            this.reloadPage(this.paused_pagination);

        },
        refreshfinishPaginationV(){
            this.current_tb="finish";
            this.searchQ="";
            this.finish_pagination.param.q="";
            document.querySelector("#bubble-tab li.pointer").style.left = "545px";
            this.finish_pagination.current = 1;
            this.reloadPage(this.finish_pagination);

        },
        refreshAuditingPaginationV(){
            this.current_tb="auditing";
            this.searchQ="";
            this.auditing_pagination.param.q="";
            document.querySelector("#bubble-tab li.pointer").style.left = "128px";
            this.auditing_pagination.current = 1;
            this.reloadPage(this.auditing_pagination);

        },
        transformSbuV(sbu){
            return PriceSbu.get(sbu);
        } 
    },
    created() {
        // todo url replace {brand_id}
        this.pageInit(this.transpagination);

    },
    updated(){
        $(function() {
            // Remove already delete element popover ,maybe is bug
            $('[data-popper-reference-hidden]').remove();
            $('.popover.custom-popover.bs-popover-auto.fade.show').remove();
            // Enable popovers 
            $('[data-bs-toggle="popover"]').popover();
        });
    }

}
const app = createApp(RootComponent);
app.mixin(Pagination);
app.mixin(new Auth({need_permission : true}));
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : false,
    scene: EventFeedScene.POD}));
app.mixin(ImageAdaptiveComponent);
app.mixin(CodeExplainComponent);
app.mixin(DirectiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('content')
}
app.mixin(new FriendListCompoent({need_init: true}));

app.mixin(
    new Ssecompoent({
        sslSetting:{
            need_init: true,
            onMessage: (e)=>{
                millStonePage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);
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

        }
     });
}
// 恢复暂停任务
function resumeTask(workflowId){

    markMillstone(workflowId,WorkflowStatus.Starred).then(response=>{
        if(response.data.code==200){
            // 刷新任务箱、暂停列表
          millStonePage.reloadPage(millStonePage.paused_pagination);

        }
     });
}


 // Enable popovers 
 $('[data-bs-toggle="popover"]').popover();

 $(function(){
	$(".tooltip-nav").tooltip();
});


function showContent(){
    const option = getQueryVariable("tab");
    if(!!option){
        $("#sp-order-tab").trigger("click");
    }
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

showContent();