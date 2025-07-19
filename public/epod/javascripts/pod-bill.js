import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Pagination  from "/common/javascripts/pagination-vue.js";
import Auth from "/estudio/javascripts/auth.js"
import axios from 'axios';

import {BillStatus,EventFeedScene} from "/common/javascripts/tm-constant.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";
import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const RootComponent = {
    data() {
        return {
            current_tb: "pending",
            searchQ: "",
            filterCategory:"",
            couponInfo: {},
            cellExpense: {
                promotionCreditPointDeductionDifference: 0,
                earlyBirdDiscountDifference: 0,
                repurchaseDiscountDifference: 0,
                amount: 0,
                promotionDeduction: 0,
                total: 0
            },
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
                    code: BillStatus.Pending,
                    q:"",
                    categories: ""
                },
                paging: {},
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.waittingpagination.size = response.bills.size;
                        this.waittingpagination.current = response.bills.current;
                        this.waittingpagination.total = response.bills.total;
                        this.waittingpagination.pages = response.bills.pages;
                        this.waittingpagination.records = response.bills.records;
                        this.waittingpagination.paging = this.doPaging({current: response.bills.current, pages: response.bills.pages, size: 5});

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
                    code: BillStatus.Paid,
                    categories: "",
                    q:""
                },
                paging: {},
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.paidpagination.size = response.bills.size;
                        this.paidpagination.current = response.bills.current;
                        this.paidpagination.total = response.bills.total;
                        this.paidpagination.pages = response.bills.pages;
                        this.paidpagination.records = response.bills.records;
                        this.paidpagination.paging = this.doPaging({current: response.bills.current, pages: response.bills.pages, size: 5});

                    }
                }
            }
        }
    },
    methods: {
        explainCategoryV(categories){
            var categoriesDesc="";
            switch(categories){
                case "cell":
                    categoriesDesc="特约";
                    break; 
                case "proposal":
                    categoriesDesc="提案";
                    break; 

            }
            return categoriesDesc;
        },
        filterBillV(){
            if(this.current_tb=="pending"){
                this.waittingpagination.current = 1;
                this.waittingpagination.param.categories=this.filterCategory;
                this.reloadPage(this.waittingpagination);
            }
            if(this.current_tb=="paid"){
                this.paidpagination.current = 1;
                this.paidpagination.param.categories=this.filterCategory;
                this.reloadPage(this.paidpagination);
            }
        },
        searchBillV(){
            this.filterCategory="";
            if(this.current_tb=="pending"){
             this.waittingpagination.current = 1;
             this.waittingpagination.param.q=this.searchQ;
             this.waittingpagination.param.categories="";
             this.reloadPage(this.waittingpagination);
            }
            if(this.current_tb=="paid"){
             this.paidpagination.current = 1;
             this.paidpagination.param.q=this.searchQ;
             this.paidpagination.param.categories="";
             this.reloadPage(this.paidpagination);
            }
        },
        refreshPendingPaginationV(){
            this.current_tb="pending";
            this.searchQ="";
            this.waittingpagination.current = 1;
            this.waittingpagination.param.q="";
            this.reloadPage(this.waittingpagination);
        },
        refreshPaidPaginationV(){
            this.current_tb="paid";
            this.searchQ="";
            this.paidpagination.current = 1;
            this.paidpagination.param.q="";
            this.reloadPage(this.paidpagination);
        },
        showBillPayFocusModalV(bill){
            showBillDetailModal(bill,this);
        },
        payBillV(billId){
            
            this.error="";
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
            this.retrieveBrandFinInfoV();
        },
        isEmptyObjectV(obj){
            return $.isEmptyObject(obj);
        }      
    },
    created() {
        // todo url replace {brand_id}
        this.pageInit(this.waittingpagination);
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
            need_init: true,
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
async function getBillDetail(billId){
    const url="/api/v1/web_epod/bill/{id}/detail".replace("{id}",billId);
    return await axios.get(url);
}
async function showBillDetailModal(bill,appObj){

    getBillDetail(bill.billId).then(response=>{

       if(response.data.code==200){
            
            calCellExpense(appObj,response.data.detail);
            appObj.focusModal.item=bill.stage;
            appObj.focusModal.amount=appObj.cellExpense.total;
            appObj.focusModal.confirmHandler=()=>{
               appObj.payBillV(bill.billId);
               $("#focusModal").modal("hide"); // show modal
            };
           $("#focusModal").modal("show"); // show modal
       }

    }).catch(err=>{
        customAlert.alert("系统异常，请检查网络或者重新发送！")
      });


}
function payBill(billId){
    return doPay(billId);
}
function retrieveBrandFinInfo(){
    return getBrandFinInfo();
}
function calCellExpense(appObj,billDetail){
    appObj.couponInfo=billDetail;
    appObj.cellExpense.amount=Number(billDetail.amount);
    
    if(!billDetail.creditPoint){
        billDetail.creditPoint=0;
    }
    appObj.cellExpense.promotionCreditPointDeductionDifference= (billDetail.amount >= Number(billDetail.creditPoint)) ? billDetail.creditPoint : billDetail.amount;

    appObj.cellExpense.repurchaseDiscountDifference=(!!billDetail.repurchaseDiscount) ? (appObj.cellExpense.amount*(100-Number(billDetail.repurchaseDiscount))/100).toFixed(2) : 0; 

    appObj.cellExpense.earlyBirdDiscountDifference= (!!billDetail.earlyBirdDiscount) ? (appObj.cellExpense.amount*(100-Number(billDetail.earlyBirdDiscount))/100).toFixed(2) : 0;

    var totalPromotionDeduction = (Number(appObj.cellExpense.promotionCreditPointDeductionDifference) + Number(appObj.cellExpense.repurchaseDiscountDifference) + Number(appObj.cellExpense.earlyBirdDiscountDifference)).toFixed(2);
    
    if(totalPromotionDeduction>=appObj.cellExpense.amount){
        appObj.cellExpense.promotionDeduction=appObj.cellExpense.amount;
    }
    if(totalPromotionDeduction<appObj.cellExpense.amount){
        appObj.cellExpense.promotionDeduction=totalPromotionDeduction;
    }
    appObj.cellExpense.total=(appObj.cellExpense.amount-appObj.cellExpense.promotionDeduction).toFixed(2);
}


 // Enable popovers 
 $('[data-bs-toggle="popover"]').popover();

 $(function(){
	$(".tooltip-nav").tooltip();
});