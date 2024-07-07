import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Pagination  from "/common/javascripts/pagination-vue.js";
import Auth from "/estudio/javascripts/auth.js"
import axios from 'axios';

import {BillStatus,EventFeedScene} from "/common/javascripts/tm-constant.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import BrandInfoComponent from "/estudio/javascripts/load-brandinfo.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";


const RootComponent = {
    data() {
        return {
            error:{},
            focusModal:{
                item: "",
                amount: "",
                drawable: "",
                confirmHandler:()=>{

                }
            },
            waittingpagination:{
                url: "/api/v1/web_epod/me/bill",
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
                        this.waittingpagination.size = response.bills.size;
                        this.waittingpagination.current = response.bills.current;
                        this.waittingpagination.total = response.bills.total;
                        this.waittingpagination.pages = response.bills.pages;
                        this.waittingpagination.records = response.bills.records;
                        this.waittingpagination.paging = this.doPaging({current: response.bills.current, pages: response.bills.pages, max: 5});

                    }
                }
            },
            paidpagination:{
                url: "/api/v1/web_epod/me/bill",
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
        showBillPayFocusModalV(bill){
            this.focusModal.item=bill.stage;
            this.focusModal.amount=bill.amount;
            this.focusModal.confirmHandler=()=>{
                this.payBillV(bill.billId);
                $("#focusModal").modal("hide"); // show modal

            };
            $("#focusModal").modal("show"); // show modal
        },
        payBillV(billId){
            payBill(billId).then(response=>{
                if(response.data.code==200){
                    $("#goTopUpModal").modal("show"); 
                    this.reload();
                }
                if(response.data.code!=200){
                    $("#goTopUpModal").modal("show"); 
                    this.error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                }
        
            }).catch(error=>{
                $("#goTopUpModal").modal("show"); 
                this.error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error;
            });
        },
        retrieveBrandFinInfoV(){
            retrieveBrandFinInfo().then(response=>{
                if(response.data.code == 200){
                    this.focusModal.drawable = response.data.billboard.drawable;
                }
            });
        },
        reload(){
            this.reloadPage(this.waittingpagination);
            this.reloadPage(this.paidpagination);
            this.retrieveBrandFinInfoV();
        },
        isEmptyObjectV(obj){
            return $.isEmptyObject(obj);
        }
        
    },
    created() {
        // todo url replace {brand_id}
        this.pageInit(this.waittingpagination);
        this.pageInit(this.paidpagination);
        this.retrieveBrandFinInfoV();
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
app.mixin(DirectiveComponent);
app.mixin(new BrandInfoComponent({need_init: true}));
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : false,
    scene: EventFeedScene.POD}));
app.mixin(ImageAdaptiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('content')
}
app.mixin(new FriendListCompoent({need_init: true}));

app.mixin(
    new Ssecompoent({
        sslSetting:{
            onMessage: (e)=>{
                billPage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);
const billPage = app.mount('#app');
window.pBill= billPage;

async function doPay(billId){
    const url="/api/v1/web_epod/bill/millstone/pay/{bill_id}".replace("{bill_id}",billId);
    return await axios.post(url);
}
async function getBrandFinInfo(){
    const url= "/api/v1/team/finance_board";
    return await axios.get(url);
}
function payBill(billId){
    return doPay(billId);
}
function retrieveBrandFinInfo(){
    return getBrandFinInfo();
}


 // Enable popovers 
 $('[data-bs-toggle="popover"]').popover();

 $(function(){
	$(".tooltip-nav").tooltip();
});