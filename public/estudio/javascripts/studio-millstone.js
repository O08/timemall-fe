import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import Pagination  from "/common/javascripts/pagination-vue.js";
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { getQueryVariable } from "/common/javascripts/util.js";
import Auth from "/estudio/javascripts/auth.js"

import BrandInfoComponent from "/estudio/javascripts/load-brandinfo.js";

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
    updated(){
        // Enable popovers 
        const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
        const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl))
    }
}
const app = createApp(RootComponent);
app.mixin(Pagination);
app.mixin(new Auth({need_permission : true}));
app.mixin(BrandInfoComponent);
const millstonePage = app.mount('#app');
window.cMillstone= millstonePage;

function showContent(){
    const option = getQueryVariable("tab");
    switch(option){
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
millstonePage.pageInit(millstonePage.auditpagination);
millstonePage.pageInit(millstonePage.taskpagination);
millstonePage.pageInit(millstonePage.finishpagination);
millstonePage.pageInit(millstonePage.confirm_pagination);
millstonePage.pageInit(millstonePage.suspend_pagination);
millstonePage.pageInit(millstonePage.paused_pagination);


showContent();
