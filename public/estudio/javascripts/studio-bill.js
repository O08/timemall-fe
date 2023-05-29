import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import Pagination  from "/common/javascripts/pagination-vue.js";
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'
import Auth from "/estudio/javascripts/auth.js"
import {refresh} from "/common/javascripts/pagenav.js";
import axios from 'axios';

import BrandInfoComponent from "/estudio/javascripts/load-brandinfo.js";
import {BillStatus,EventFeedScene} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 


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
        },
        viewReceiptV(url){
            viewReceipt(url);
        },
        bankSettingV()
        {
            bankSetting();
        },
        previewAlipayV(e){
            previewAlipay(e);
        },
        previewWechatpayV(e){
            previewWechatpay(e);
        },
        alipaySettingV(){
            alipaySetting();
        },
        wechatpaySetting(){
            wechatpaySetting();
        },
        activeSaveBankBtn(){
            this.bank_already_change = true;
        },
        loadBrandPaywayV(){
            getBrandPayway();
        },
        closeViewWechatpayModalHandlerV(){
            closeViewWechatpayModalHandler();
        },
        closeviewAlipayModalHandlerV(){
            closeviewAlipayModalHandler();
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
app.mixin(BrandInfoComponent);
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : false,
    scene: EventFeedScene.STUDIO}));
app.mixin(ImageAdaptiveComponent);
const studioBillPage = app.mount('#app');
window.cBill= studioBillPage;
// init 
studioBillPage.loadBrandPaywayV();
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

function getBrandPayway(){
    const url = "/api/v1/web_estudio/brand/info";
    $.get(url,function(data) {
        if(data.code == 200){
            studioBillPage.payway = data.brand.payway;
        }
       })
}

function saveBankInfo(brandId,bank)
{
    const url = "/api/v1/web_estudio/brand/{brand_id}/pay_setting/bank".replace("{brand_id}",brandId);
    $.ajax({
        url: url,
        data: JSON.stringify({bank: bank}),
        type: "put",
        dataType:"json",
        contentType: "application/json",
        success:function(data){
            // todo 
            if(data.code == 200){
              studioBillPage.bank_already_change = false;
            }
        },
        error:function(){
            //alert('error'); //错误的处理
        }
    });
}
async function saveAliPayImg(brandId, files){
    var fd = new FormData();
    fd.append('file', files);
    const url = "/api/v1/web_estudio/brand/{brand_id}/pay_setting/ali_pay".replace("{brand_id}",brandId);
    var res = await axios.put(url, fd);
    return res;
}

async function saveWechatPayImg(brandId, files){
    var fd = new FormData();
    fd.append('file', files);
    const url = "/api/v1/web_estudio/brand/{brand_id}/pay_setting/wechat_pay".replace("{brand_id}",brandId);
    var res = await axios.put(url, fd);
    return res;
}


function launchPay(billId){
    const code = BillStatus.Pending; // todo
    markBill(billId,code);
}


function viewReceipt(url)
{   
    $("#receiptPreview").attr('src',url);
    $("#link-download-receipt").attr("download",url);
    $("#viewReceiptModal").modal("show");
}

function bankSetting()
{
    const brandId =  studioBillPage.getIdentity().brandId; // Auth.getIdentity();
    saveBankInfo(brandId,studioBillPage.payway.bank);
}
function previewAlipay(e){
    const file = e.target.files[0]

    const URL2 = URL.createObjectURL(file)
    $('#alipayPreview').attr('src',URL2);
    $("#viewAlipayModal").modal("show");
}
function previewWechatpay(e){
    const file = e.target.files[0]

    const URL2 = URL.createObjectURL(file)
    $('#wechatpayPreview').attr('src',URL2);
    $("#viewWechatpayModal").modal("show");
}

function alipaySetting()
{
    const brandId =  studioBillPage.getIdentity().brandId; // Auth.getIdentity();
    const file = $('#alipayCodeFile')[0].files[0];
    saveAliPayImg(brandId,file).then(function (response) {
    if(response.data.code == 200){
        const url = URL.createObjectURL(file)
        $('#lastestAlipay').attr('src',url);
        $("#viewAlipayModal").modal("hide");
        $('#alipayPreview').attr('src',"");
    }
    })
}
function wechatpaySetting(){
    const brandId =  studioBillPage.getIdentity().brandId; // Auth.getIdentity();
    const file = $('#wechatPayCodeFile')[0].files[0];
    saveWechatPayImg(brandId,file).then(function (response) {
        if(response.data.code == 200){
            const url = URL.createObjectURL(file)
         $('#lastestWechatPay').attr('src',url);
 
         $("#viewWechatpayModal").modal("hide");
         $('#wechatpayPreview').attr('src',"");
        }
    })
}
// close modal handler
function closeviewAlipayModalHandler(){
    document.querySelector('#alipayPreview').src = "";
    document.querySelector('#alipayCodeFile').value = null;
}
function closeViewWechatpayModalHandler(){
    document.querySelector('#wechatpayPreview').src = "";
    document.querySelector('#wechatPayCodeFile').value = null;
}


// Enable popovers 

const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl))