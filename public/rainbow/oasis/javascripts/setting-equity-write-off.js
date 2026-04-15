import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from "axios";

import Auth from "/estudio/javascripts/auth.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import  OasisApi from "/rainbow/javascripts/oasis/OasisApi.js";
import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';

import Pagination  from "/common/javascripts/pagination-vue.js";
import { CodeExplainComponent } from "/common/javascripts/compoent/code-explain-compoent.js";

import { renderDateInChina } from "/common/javascripts/util.js";



let customAlert = new CustomAlertModal();

const pathname = window.location.pathname; 
const segments = pathname.split('/').filter(Boolean); // filter(Boolean) removes empty strings from leading/trailing slashes

const [currentOasisHandle,] = segments;

const oasisAvatarDefault = new URL(
    '/rainbow/images/oasis-default-building.jpeg',
    import.meta.url
);

const currencyFormatter = new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
});
  

const RootComponent = {
    data() {
      return {
        init_finish: false,
        oasisAvatarDefault,
        oasisId: "",
        oasisHandle: "",
        announce: {},
        oassisLatestEquitySummary: {},
        writeOffPendingOrder: {},
        order_pagination: {
            url: "/api/v1/team/oasis/equity/orders/query",
            size: 10,
            current: 1,
            total: 0,
            pages: 0,
            records: [],
            paging: {},
            param: {
              q: '',
              status: "",
              period: ""
            },
            paramHandler: (info)=>{
                info.param.oasisId = this.oasisId;
            },
            responesHandler: (response)=>{
                if(response.code == 200){
                    this.order_pagination.size = response.order.size;
                    this.order_pagination.current = response.order.current;
                    this.order_pagination.total = response.order.total;
                    this.order_pagination.pages = response.order.pages;
                    this.order_pagination.records = response.order.records;
                    this.order_pagination.paging = this.doPaging({current: response.order.current, pages: response.order.pages, size: 5});
    
                }
            }
        },
      }
    },
    methods: {
        renderDateInChinaV(dateStr){
            return renderDateInChina(dateStr);
        },
        redeemEquityOrderV(){
            redeemEquityOrder(this.writeOffPendingOrder.orderId).then(response => {
                if (response.data.code == 200) {

                   this.reloadPage(this.order_pagination);
                   this.loadOasisLatestPeriodEquitySummaryV();
                   this.closeWriteOffEquityModalV();
        
                }
                if(response.data.code==40007){
                    customAlert.alert("部落余额不足，处理失败"); 
                    return ;
                }
                if (response.data.code != 200) {
                    const error = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message;
                    customAlert.alert(error);
                }
            }).catch(error => {
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
            });
        },
        loadOasisLatestPeriodEquitySummaryV(){
            OasisApi.loadOasisLatestPeriodEquitySummary(this.oasisId).then(response => {
                if (response.data.code == 200) {
        
                   this.oassisLatestEquitySummary=response.data.summary;
        
                }
                if (response.data.code != 200) {
                    const error = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message;
                    customAlert.alert(error);
                }
            }).catch(error => {
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
            });
        },
        showWriteOffEquityModalV(order){
            this.writeOffPendingOrder=JSON.parse(JSON.stringify(order));
            $("#writeOffEquityModal").modal("show"); // hide modal
        },
        closeWriteOffEquityModalV(){
            $("#writeOffEquityModal").modal("hide"); // hide modal
        },
        retrieveOrderV(){
            this.order_pagination.current=1;
            this.order_pagination.param.period="";
            this.order_pagination.param.status="";
            this.reloadPage(this.order_pagination);
        },
        filterOrderV(){
            this.order_pagination.current=1;
            this.reloadPage(this.order_pagination);
        },
        async initPageDataV(){
            const response = await OasisApi.loadAnnounceUsingHandle(currentOasisHandle);
            if(response.data.code == 200){
                this.announce = response.data.announce;
          
                if (!this.announce || this.announce.initiator != this.getIdentity().brandId) {
                    window.location.href = "/rainbow/teixcalaanli";
                }

                this.oasisId = this.announce.id;
                this.oasisHandle= this.announce.handle;
                this.loadOasisLatestPeriodEquitySummaryV();

                this.pageInit(this.order_pagination);


            }
        },
        displayFee(fee) {
            const numericFee = Number(fee);
            const isInvalid = (fee == null || fee === '' || isNaN(numericFee));
          
            return isInvalid ? '--' : currencyFormatter.format(numericFee);
        }
        
    },
    created(){

    },
    updated(){
        
        $(function() {
            // Enable popovers 
            $('[data-bs-toggle="popover"]').popover();
        });

    }
}



let app =  createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);
app.mixin(Pagination);
app.mixin(CodeExplainComponent);

app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('col-')
}

const settingWriteOffEquity = app.mount('#app');

window.settingWriteOffEquityPage = settingWriteOffEquity;

// init
settingWriteOffEquity.initPageDataV()




async function doReedeemOneOrder(orderId){
    const url = "/api/v1/team/oasis/equity/orders/{id}/redeem".replace("{id}",orderId);
    return await   axios.post(url);
}

async function redeemEquityOrder(orderId){
    return await doReedeemOneOrder(orderId);
}


