import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Pagination  from "/common/javascripts/pagination-vue.js";
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { getQueryVariable } from "/common/javascripts/util.js";
import Auth from "/estudio/javascripts/auth.js"

import {EventFeedScene,PriceSbu} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import {CodeExplainComponent} from "/common/javascripts/compoent/code-explain-compoent.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";

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
            newOrderPagination:{
                url: "/api/v1/web_estudio/brand/millstone/workflow",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                    code: WorkflowStatus.InQueue
                },
                paging: {},
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.newOrderPagination.size = response.transactions.size;
                        this.newOrderPagination.current = response.transactions.current;
                        this.newOrderPagination.total = response.transactions.total;
                        this.newOrderPagination.pages = response.transactions.pages;
                        this.newOrderPagination.records = response.transactions.records;
                        this.newOrderPagination.paging = this.doPaging({current: response.transactions.current, pages: response.transactions.pages, max: 5});
                    }
                }
            },
            finishpagination:{
                url: "/api/v1/web_estudio/brand/millstone/workflow",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                    code: WorkflowStatus.Finish
                },
                paging: {},
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.finishpagination.size = response.transactions.size;
                        this.finishpagination.current = response.transactions.current;
                        this.finishpagination.total = response.transactions.total;
                        this.finishpagination.pages = response.transactions.pages;
                        this.finishpagination.records = response.transactions.records;
                        this.finishpagination.paging = this.doPaging({current: response.transactions.current, pages: response.transactions.pages, max: 5});
                    }
                }
            },  
            confirm_pagination:{
                url: "/api/v1/web_estudio/brand/millstone/workflow",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                    code: WorkflowStatus.Audited
                },
                paging: {},
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.confirm_pagination.size = response.transactions.size;
                        this.confirm_pagination.current = response.transactions.current;
                        this.confirm_pagination.total = response.transactions.total;
                        this.confirm_pagination.pages = response.transactions.pages;
                        this.confirm_pagination.records = response.transactions.records;
                        this.confirm_pagination.paging = this.doPaging({current: response.transactions.current, pages: response.transactions.pages, max: 5});
                    }
                }
            },
            taskpagination:{
                url: "/api/v1/web_estudio/brand/millstone/workflow",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                    code: WorkflowStatus.Starred
                },
                paging: {},
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.taskpagination.size = response.transactions.size;
                        this.taskpagination.current = response.transactions.current;
                        this.taskpagination.total = response.transactions.total;
                        this.taskpagination.pages = response.transactions.pages;
                        this.taskpagination.records = response.transactions.records;
                        this.taskpagination.paging = this.doPaging({current: response.transactions.current, pages: response.transactions.pages, max: 5});
                    }
                }
            },
            auditpagination: {
                url: "/api/v1/web_estudio/brand/millstone/workflow",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                    code: WorkflowStatus.Auditing
                },
                paging: {},
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.auditpagination.size = response.transactions.size;
                        this.auditpagination.current = response.transactions.current;
                        this.auditpagination.total = response.transactions.total;
                        this.auditpagination.pages = response.transactions.pages;
                        this.auditpagination.records = response.transactions.records;
                        this.auditpagination.paging = this.doPaging({current: response.transactions.current, pages: response.transactions.pages, max: 5});
                    }
                }
            },
            paused_pagination:{
                url: "/api/v1/web_estudio/brand/millstone/workflow",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                    code: WorkflowStatus.Paused
                },
                paging: {},
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.paused_pagination.size = response.transactions.size;
                        this.paused_pagination.current = response.transactions.current;
                        this.paused_pagination.total = response.transactions.total;
                        this.paused_pagination.pages = response.transactions.pages;
                        this.paused_pagination.records = response.transactions.records;
                        this.paused_pagination.paging = this.doPaging({current: response.transactions.current, pages: response.transactions.pages, max: 5});
                    }
                }
            },
            suspend_pagination:{
                url: "/api/v1/web_estudio/brand/millstone/workflow",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                    code: WorkflowStatus.Suspend
                },
                paging: {},
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.suspend_pagination.size = response.transactions.size;
                        this.suspend_pagination.current = response.transactions.current;
                        this.suspend_pagination.total = response.transactions.total;
                        this.suspend_pagination.pages = response.transactions.pages;
                        this.suspend_pagination.records = response.transactions.records;
                        this.suspend_pagination.paging = this.doPaging({current: response.transactions.current, pages: response.transactions.pages, max: 5});
                    }
                }
            }
        }

    },
    methods: {
        refreshTranspaginationV(){
            document.querySelector("#bubble-tab li.pointer").style.left = "40px";
            this.newOrderPagination.current = 1;
            this.reloadPage(this.newOrderPagination);
        },
        refreshStarredTranspaginationV(){
            document.querySelector("#bubble-tab li.pointer").style.left = "300px";
            this.taskpagination.current = 1;
            this.reloadPage(this.taskpagination);
        },
        refreshConfirmPaginationV(){
            document.querySelector("#bubble-tab li.pointer").style.left = "200px";
            this.confirm_pagination.current = 1;
            this.reloadPage(this.confirm_pagination);
        },
        refreshSuspendPaginationV(){
            document.querySelector("#bubble-tab li.pointer").style.left = "480px";
            this.suspend_pagination.current = 1;
            this.reloadPage(this.suspend_pagination);
        },
        refreshPausedPaginationV(){
            document.querySelector("#bubble-tab li.pointer").style.left = "390px";
            this.paused_pagination.current = 1;
            this.reloadPage(this.paused_pagination);

        },
        refreshfinishPaginationV(){
            document.querySelector("#bubble-tab li.pointer").style.left = "580px";
            this.finishpagination.current = 1;
            this.reloadPage(this.finishpagination);

        },
        refreshAuditingPaginationV(){
            document.querySelector("#bubble-tab li.pointer").style.left = "108px";
            this.auditpagination.current = 1;
            this.reloadPage(this.auditpagination);

        },
        transformSbuV(sbu){
            return PriceSbu.get(sbu);
        } 
    },
    updated(){
        $('[data-popper-reference-hidden]').remove();
        $('.popover.custom-popover.bs-popover-auto.fade.show').remove();
        // Enable popovers 
        const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
        const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl))
    }
}
const app = createApp(RootComponent);
app.mixin(Pagination);
app.mixin(new Auth({need_permission : true}));
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : false,
    scene: EventFeedScene.STUDIO}));
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
                millstonePage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);
const millstonePage = app.mount('#app');
window.cMillstone= millstonePage;

function showContent(){
    const option = getQueryVariable("tab");
    if(!!option){
        $("#sp-order-tab").trigger("click");
    }
    switch(option){
        case "audit":
            $("#audit-tab").trigger("click");
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


// init 
millstonePage.pageInit(millstonePage.newOrderPagination);


showContent();

$(function(){
	$(".tooltip-nav").tooltip();
});
