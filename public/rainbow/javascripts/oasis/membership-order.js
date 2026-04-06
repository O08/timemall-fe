
import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import TeicallaanliSubNavComponent from "/rainbow/javascripts/compoent/TeicallaanliSubNavComponent.js"
import OasisAnnounceInterfaceComponent from "/rainbow/javascripts/compoent/OasisAnnounceInterfaceComponent.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import {OasisOptionCtlComponent} from '/rainbow/oasis/javascripts/oasis-option-ctl-component.js'; 
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import {OasisFastLinkComponent} from '/rainbow/oasis/javascripts/oasis-fast-link-component.js';

import { CodeExplainComponent } from "/common/javascripts/compoent/code-explain-compoent.js";


import { renderDateInChina,renderDateToDayInChina } from "/common/javascripts/util.js";
import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';


let customAlert = new CustomAlertModal();

const pathname = window.location.pathname; 
const segments = pathname.split('/').filter(Boolean); // filter(Boolean) removes empty strings from leading/trailing slashes

const [currentOasisHandle,] = segments;


const RootComponent = {
    components: {
        oasisoptions: OasisOptionCtlComponent,fastlinks: OasisFastLinkComponent
    },
    data() {

        return {
            currentOch: "oasis-home",
            q: "",
            order: {
                records: []
            },
            orderDetail: {},
            refundObj: {
              orderId: "",
              term: ""
            }
        }
    },
    methods: {
        handleJoinSuccessEventV(){
            this.loadJoinedOases(); // sub nav component.js
        },
        handleUnfollowSuccessEventV(){
            this.loadJoinedOases(); // sub nav component.js
        },
        loadOrdersV(oasisId){
            if(!this.oasisId) this.oasisId=oasisId;
            loadOrders(this.q,this.oasisId).then(response=>{
                if(response.data.code == 200){
                    this.order = response.data.order;
                }
            })
        },
        showOrderDetailModalV(orderId) {
            findOrderInfo(orderId).then(response=>{
                if(response.data.code == 200){
                    
                    this.orderDetail=response.data.order;
                    $("#orderDetailModal").modal("show");
        
                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error); 
                }
              });
        },
        showRefundModalV(order) {
            this.refundObj.orderId=order.orderId;
            this.refundObj.term="";
            $("#orderDetailModal").modal("hide");

            $("#orderRefundModal").modal("show"); // show modal
        },
        closeRefundModalV(){
            $("#orderRefundModal").modal("hide");
            $("#orderDetailModal").modal("show");
        },
        refundV(){
            refund(this.refundObj).then(response=>{
                if(response.data.code == 200){
                   this.loadOrdersV();
                   this.orderDetail.status='8';// change status to refund
                   this.closeRefundModalV();
        
                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error); 
                }
            });
        },
        renderDateInChinaV(dateStr){
           return renderDateInChina(dateStr);
        },
        renderDateToDayInChinaV(dateStr){
           return renderDateToDayInChina(dateStr);
        },
        getStatusClass(status) {
            // 状态映射: 1-待支付, 2-已支付, 3-已取消, 8-已退款
            const statusMap = {
                '1': 'status-pending',
                '2': 'status-paid',
                '3': 'status-cancelled',
                '8': 'status-refunded'
            };
            return statusMap[status] || 'status-pending';
        }
    },
    updated(){
        
        $(function() {
            // Enable popovers 
            $('[data-bs-toggle="popover"]').popover();
        });
    }
}
let app =  createApp(RootComponent);
app.mixin(new Auth({need_permission : true,need_init: false}));
app.mixin(TeicallaanliSubNavComponent);
app.mixin(OasisAnnounceInterfaceComponent);
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);
app.mixin(CodeExplainComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('col-') || tag.startsWith('top-')
}
const teamOasisMembershipOrderPage = app.mount('#app');

window.teamOasisMembershipOrderPage = teamOasisMembershipOrderPage;
// init 
teamOasisMembershipOrderPage.userAdapter(); // auth.js init
teamOasisMembershipOrderPage.loadSubNav() // sub nav component .js init 
teamOasisMembershipOrderPage.loadAnnounceAndFastLinkAndChannelListUseHandleV(currentOasisHandle,teamOasisMembershipOrderPage.loadOrdersV)

async function getOrder(oasisId,q){
    const url="/api/v1/team/membership/open_order/list?current=1&size=100&oasisId=" + oasisId+"&q="+q;
    return await axios.get(url);
}
async function fetchOrderInfo(orderId){
    const url="/api/v1/team/membership/open_order/{id}/detail".replace("{id}",orderId);
    return await axios.get(url);
}
async function doRefund(dto){
    const url="/api/v1/team/membership/open_order/refund";
    return await axios.post(url,dto);
}  
async function refund(dto){
    return await doRefund(dto);
 }
async function findOrderInfo(orderId){
    return await fetchOrderInfo(orderId);
  }
function loadOrders(q,oasisId){
    return getOrder(oasisId,q);
}