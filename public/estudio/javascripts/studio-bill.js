import "/common/javascripts/import-jquery.js";
import { createApp } from "vue/dist/vue.esm-browser.js";
import Pagination  from "/common/javascripts/pagination-vue.js";
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'
import Auth from "/estudio/javascripts/auth.js"
import {refresh} from "/common/javascripts/pagenav.js";
import axios from 'axios';

var BillStatus = Object.freeze({
    "Created": 1, // 创建
    "Pending":2, // 未支付
    "Paid":3 // 已支付
});
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
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.waitpagination.size = response.bills.size;
                        this.waitpagination.current = response.bills.current;
                        this.waitpagination.total = response.bills.total;
                        this.waitpagination.pages = response.bills.pages;
                        this.waitpagination.records = response.bills.records;
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
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.pending_pagination.size = response.bills.size;
                        this.pending_pagination.current = response.bills.current;
                        this.pending_pagination.total = response.bills.total;
                        this.pending_pagination.pages = response.bills.pages;
                        this.pending_pagination.records = response.bills.records;
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
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.paidpagination.size = response.bills.size;
                        this.paidpagination.current = response.bills.current;
                        this.paidpagination.total = response.bills.total;
                        this.paidpagination.pages = response.bills.pages;
                        this.paidpagination.records = response.bills.records;
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


// Enable popovers 

const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl))