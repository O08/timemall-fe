import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Pagination  from "/common/javascripts/pagination-vue.js";
import Auth from "/estudio/javascripts/auth.js"

import {EventFeedScene} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 

import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";

const RootComponent = {
    data() {
        return {
            payrollList_pagination: {
                url: "/api/v1/team/office/payroll/employee_query",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                paging: {},
                param: {},
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.payrollList_pagination.size = response.payroll.size;
                        this.payrollList_pagination.current = response.payroll.current;
                        this.payrollList_pagination.total = response.payroll.total;
                        this.payrollList_pagination.pages = response.payroll.pages;
                        this.payrollList_pagination.records = response.payroll.records;
                        this.payrollList_pagination.paging = this.doPaging({current: response.payroll.current, pages: response.payroll.pages, size: 5});
        
                    }
                }
            },
        }
    },

}
const app = createApp(RootComponent);
app.mixin(Pagination);
app.mixin(new Auth({need_permission : true}));
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : true,
    scene: EventFeedScene.POD}));
app.mixin(ImageAdaptiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('content')
}
app.mixin(new FriendListCompoent({need_init: true}));

app.mixin(
    new Ssecompoent({
        sslSetting:{
            need_init: true,
            onMessage: (e)=>{
                salaryPage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);
const salaryPage = app.mount('#app');
window.pSalaryPage= salaryPage;

// init
salaryPage.pageInit(salaryPage.payrollList_pagination);


 // Enable popovers 
 $('[data-bs-toggle="popover"]').popover();

 $(function(){
	$(".tooltip-nav").tooltip();
});