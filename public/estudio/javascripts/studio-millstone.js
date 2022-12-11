import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import Pagination  from "/common/javascripts/pagination-vue.js";
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { getQueryVariable } from "/common/javascripts/util.js";
import Auth from "/estudio/javascripts/auth.js"


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
                    code: '3'
                },
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.taskpagination.size = response.transactions.size;
                        this.taskpagination.current = response.transactions.current;
                        this.taskpagination.total = response.transactions.total;
                        this.taskpagination.pages = response.transactions.pages;
                        this.taskpagination.records = response.transactions.records;
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
                    code: '2'
                },
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.taskpagination.size = response.transactions.size;
                        this.taskpagination.current = response.transactions.current;
                        this.taskpagination.total = response.transactions.total;
                        this.taskpagination.pages = response.transactions.pages;
                        this.taskpagination.records = response.transactions.records;
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
                    code: '1'
                },
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.auditpagination.size = response.transactions.size;
                        this.auditpagination.current = response.transactions.current;
                        this.auditpagination.total = response.transactions.total;
                        this.auditpagination.pages = response.transactions.pages;
                        this.auditpagination.records = response.transactions.records;
                    }
                }
            },
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
const millstonePage = app.mount('#app');
window.cMillstone= millstonePage;

function showContent(){
    const option = getQueryVariable("option");
    if(option === "task"){
        $("#task-tab").trigger("click");
    }
}


// init 
millstonePage.pageInit(millstonePage.auditpagination);
millstonePage.pageInit(millstonePage.taskpagination);
millstonePage.pageInit(millstonePage.finishpagination);
showContent();
