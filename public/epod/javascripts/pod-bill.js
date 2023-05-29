import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import Pagination  from "/common/javascripts/pagination-vue.js";
import Auth from "/estudio/javascripts/auth.js"
import axios from 'axios';

import {BillStatus,EventFeedScene} from "/common/javascripts/tm-constant.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import BrandInfoComponent from "/estudio/javascripts/load-brandinfo.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 

const RootComponent = {
    data() {
        return {
            payway: {
                bank: {}
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
        showPaywayInfoForBrandV(brandId){
            showPaywayInfoForBrand(brandId);
        },
        notifyBrandV(billId){
            notifyBrand(billId);
        },
        previewReceiptV(e,billId){
            previewReceipt(e,billId);
                 
        },
        uploadReceiptV(){
            uploadReceipt();
        },
        viewReceiptV(uri){
            viewReceipt(uri);
        },
        reloadTable(){
            this.reloadPage(this.waittingpagination);
            this.reloadPage(this.paidpagination);
        },
        closeReceiptModalHandlerV(){
            closeReceiptModalHandler();
        }
        
    },
    created() {
        // todo url replace {brand_id}
        this.pageInit(this.waittingpagination);
        this.pageInit(this.paidpagination);
    },
    updated(){
        $(function() {
            console.log("aaa");
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
app.mixin(BrandInfoComponent);
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : false,
    scene: EventFeedScene.POD}));
app.mixin(ImageAdaptiveComponent);

const billPage = app.mount('#app');
window.pBill= billPage;

async function getBrandPayway(brandId)
{
    const url = "/api/v1/web_epod/brand/{brand_id}/payway".replace("{brand_id}",brandId);
    return await axios.get(url);
}
async function markBill(billId){
    const url = "/api/v1/web_epod/bill/{bill_id}/mark".replace("{bill_id}",billId) + "?code=" + BillStatus.Paid;
     return await axios.put(url);
}

async function saveReceiptImg(billId,files){
    var fd = new FormData();
    fd.append('file', files);
    const url = "/api/v1/web_epod/bill/{bill_id}/voucher".replace("{bill_id}",billId);
    var res = await axios.put(url, fd);
    return res;
}
function notifyBrand(billId){
    markBill(billId).then(response=>{
        if(response.data.code==200){
            billPage.reloadTable();
        }
    });
}
function findBrandPaywayInfo(brandId){
    getBrandPayway(brandId).then(response=>{
        if(response.data.code== 200){
            billPage.payway =response.data.payway;
        }
    })    
}

function showPaywayInfoForBrand(brandId){
    findBrandPaywayInfo(brandId);
    $("#displayModal").modal("show");
}
function previewReceipt(e,billId){
    const file = e.target.files[0]

    const URL2 = URL.createObjectURL(file);
    $('#btn-save-receipt').show();
    $("#btn-save-receipt").data('billid',billId); // tmp store bill id
    $('#receiptPreview').attr('src',URL2);
    $("#receiptModal").modal("show");
}
function uploadReceipt(){
   const billId = $('#btn-save-receipt').data('billid');
   const file = $('#receiptFile')[0].files[0];
    saveReceiptImg(billId,file).then(response=>{
        if(response.data.code==200){
            $("#receiptModal").modal("hide");
            $('#receiptPreview').attr('src',"");
        }
    });
}
function viewReceipt(uri){
    $('#receiptPreview').attr('src',uri);
    $('#btn-save-receipt').hide();
    $("#receiptModal").modal("show");
}


// close modal handler
function closeReceiptModalHandler(){
    document.querySelector('#receiptPreview').src = "";
    document.querySelector('#receiptFile').value = null;
}
 // Enable popovers 
 $('[data-bs-toggle="popover"]').popover();