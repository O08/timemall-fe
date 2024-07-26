import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Pagination  from "/common/javascripts/pagination-vue.js";
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'
import Auth from "/estudio/javascripts/auth.js"
import {refresh} from "/common/javascripts/pagenav.js";

import {BillStatus,EventFeedScene} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";

const RootComponent = {
    data() {
        return {
            payway: {
                bank: {
                    cardholder: "",
                    cardNo: ""
                }
            },
            bank_already_change: false,
            waitpagination: {
                url: "/api/v1/web_estudio/brand/bill",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                    code: BillStatus.Created
                },
                paging: {},
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.waitpagination.size = response.bills.size;
                        this.waitpagination.current = response.bills.current;
                        this.waitpagination.total = response.bills.total;
                        this.waitpagination.pages = response.bills.pages;
                        this.waitpagination.records = response.bills.records;
                        this.waitpagination.paging = this.doPaging({current: response.bills.current, pages: response.bills.pages, max: 5});

                    }
                }
            },
            pending_pagination: {
                url: "/api/v1/web_estudio/brand/bill",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                    code: BillStatus.Pending
                },
                paging: {},
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.pending_pagination.size = response.bills.size;
                        this.pending_pagination.current = response.bills.current;
                        this.pending_pagination.total = response.bills.total;
                        this.pending_pagination.pages = response.bills.pages;
                        this.pending_pagination.records = response.bills.records;
                        this.pending_pagination.paging = this.doPaging({current: response.bills.current, pages: response.bills.pages, max: 5});

                    }
                }
            },
            paidpagination: {
                url: "/api/v1/web_estudio/brand/bill",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                    code: BillStatus.Paid
                },
                paging: {},
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.paidpagination.size = response.bills.size;
                        this.paidpagination.current = response.bills.current;
                        this.paidpagination.total = response.bills.total;
                        this.paidpagination.pages = response.bills.pages;
                        this.paidpagination.records = response.bills.records;
                        this.paidpagination.paging = this.doPaging({current: response.bills.current, pages: response.bills.pages, max: 5});

                    }

                }
            }
        }
    },
    methods: {
        launchPayV(billId){
            launchPay(billId);
        }
    },
    created() {
         this.pageInit(this.waitpagination);
         this.pageInit(this.paidpagination);
         this.pageInit(this.pending_pagination);
    }
}
const app = createApp(RootComponent);
app.mixin(Pagination);
app.mixin(new Auth({need_permission : true}));
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : false,
    scene: EventFeedScene.STUDIO}));
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
                studioBillPage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);

const studioBillPage = app.mount('#app');
window.cBill= studioBillPage;




function markBill(billId,code){
    var url = "/api/v1/web_estudio/bill/{bill_id}/mark".replace("{bill_id}",billId);  
    url= url + "?code=" + code
     
    $.ajax({
        url: url,
        type: "put",
        dataType:"json",
        success:function(data){
            // todo 
            if(data.code == 200){
                refresh();
            }
        },
        error:function(){
            //alert('error'); //错误的处理
        }
    });  
}




function launchPay(billId){
    const code = BillStatus.Pending; // todo
    markBill(billId,code);
}




// Enable popovers 

const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl))

$(function(){
	$(".tooltip-nav").tooltip();
});