import axios from "axios";
import { getQueryVariable } from "/common/javascripts/util.js";
import {CommercialPaperDeliverTag} from "/common/javascripts/tm-constant.js";
import {RefundSceneEnum} from "/common/javascripts/tm-constant.js";
import { uploadCellDataLayerWhenBuyPlan } from "/common/javascripts/science.js";

import {Api} from "/common/javascripts/common-api.js";
import {EmailNoticeEnum} from "/common/javascripts/tm-constant.js";

import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const CellPlanOrderDeliverCompoent = {
    data() {
        return {
            error:{},
            mpdc__paperDeliver:{},
            focusModal:{
                feed: "",
                confirmHandler:()=>{

                }
            },
            repayFocusModal:{
                feed: "",
                confirmHandler:()=>{

                }
            }
        }
    },
    methods: {
        closRePayFocusModalV(){
            $("#repayFocusModal").modal("hide"); // show modal
        },
        showRePayFocusModalV(){
            this.repayFocusModal.feed="支付成功后，您的资金将转存到bluvarri.com, 待您接受交付后才会结算到商家；支持无条件退款"
            this.repayFocusModal.confirmHandler=()=>{
                this.repayV();
                $("#repayFocusModal").modal("hide"); // show modal

            };
            $("#repayFocusModal").modal("show"); // show modal
        },
        showAcceptDeliverFocusModalV(deliver){
            this.focusModal.feed="接受交付后，将解锁服务商的交付资料，同时您的服务款项将打入服务商账户，可点击 确定 接受交付"
            this.focusModal.confirmHandler=()=>{
                this.acceptPaperDeliverV(deliver);
                $("#focusModal").modal("hide"); // show modal

            };
            $("#focusModal").modal("show"); // show modal
        },
        showRejectDeliverFocusModalV(deliver){
            this.focusModal.feed="查看服务商提供的交付预览资料后，有新的修改意见、想法，可点击 确定 退回修订"
            this.focusModal.confirmHandler=()=>{
                this.revisionPaperDeliverV(deliver);
                $("#focusModal").modal("hide"); // show modal

            };
            $("#focusModal").modal("show"); // show modal
        },
        showRefundFocusModalV(){
            this.focusModal.feed="提交退款申请后将无法撤回，如服务商的交付质量难以满足要求，点击 确定 无条件退款"
            this.focusModal.confirmHandler=()=>{
                this.refundV();
                $("#focusModal").modal("hide"); // show modal
            }
            $("#focusModal").modal("show"); // show modal
        },
        repayV(){
            repay().then(response=>{
                if(response.data.code==200){
                    this.findPlanDetailV();// from packages-order-deliver.js
                    this.doFetchPaperDeliverDetailV();

                    Api.sendOrderReceivingEmail(EmailNoticeEnum.CELL_PLAN_ORDER_RECEIVING,response.data.planOrderId);
                    // scinece data
                    uploadCellDataLayerWhenBuyPlan(this.orderDetail.planType,this.orderDetail.cellId);

                    customAlert.alert("付款成功！");
                }
                if(response.data.code==40007){
                    $("#errorModal").modal("show"); 
                    this.error=response.data.message + ",可前往商城充值。";
                    return ;
                }
                if(response.data.code!=200){
                    $("#errorModal").modal("show"); 
                    this.error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                }

            }).catch(error=>{
                this.error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error;
            });
        },
        refundV(){
            refund().then(response=>{
                if(response.data.code==200){
                    this.findPlanDetailV();// from packages-order-deliver.js
                    this.doFetchPaperDeliverDetailV();
                    customAlert.alert("单品订单已退款！");
                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error);
                }

            }).catch(error=>{
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
            });
        },
        closeDeliverPaperModalHandlerV(){
            //reset input file
            document.querySelector('#inputPreviewFile').value = null;
            document.querySelector('#inputDeliverFile').value = null;

        },
        showAddNewDeliverModalV(){
            $("#newDeliverModal").modal("show"); // show modal
        },
        fetchPaperDeliverDetailV(){
            const orderId=getQueryVariable("id");
            doFetchPaperDeliverDetail(orderId).then(response=>{
                if(response.data.code==200){
                    this.mpdc__paperDeliver=response.data.deliver;
                }
            })
        },
        doFetchPaperDeliverDetailV(){
            const orderId=getQueryVariable("id");
            if(!orderId){
                return;
            }
            fetchPaperDeliverDetailForBrand(orderId).then(response=>{
                if(response.data.code==200){
                    this.mpdc__paperDeliver=response.data.deliver;
                }
            })
        },
        deliverPaperV(){
            deliverPaper().then(response=>{
                if(response.data.code==200){
                    this.findPlanDetailV();// from packages-order-deliver.js
                    $("#newDeliverModal").modal("hide"); // hide modal
                    this.doFetchPaperDeliverDetailV();
                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error);
                }
            }).catch(error=>{
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
            });
        },
        leaveMessageV(deliver){
            leaveMessage(deliver.deliverId,deliver.newMsg).then(response=>{
                if(response.data.code==200){
                    deliver.msg = deliver.newMsg
                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error); 
                }
            }).catch(error=>{
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
            });
        },
        revisionPaperDeliverV(deliver){
            if(!deliver.orderId){
                deliver.orderId=getQueryVariable("id");
            }
           modifyPaperDeliverTag(CommercialPaperDeliverTag.REVISION,deliver.deliverId,deliver.orderId).then(response=>{
                if(response.data.code==200){
                    this.fetchPaperDeliverDetailV();
                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error);        
                }
            }).catch(error=>{
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
            });
        },
        acceptPaperDeliverV(deliver){
            if(!deliver.orderId){
                deliver.orderId=getQueryVariable("id");
            }
            modifyPaperDeliverTag(CommercialPaperDeliverTag.DELIVERED,deliver.deliverId,deliver.orderId).then(response=>{
                if(response.data.code==200){
                    this.fetchPaperDeliverDetailV();
                 }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error);

                }
            }).catch(error=>{
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
            });
        },
        paperDeliverTagExplainV(tag){
           return paperDeliverTagExplain(tag);
        }
    }

}
async function doFetchPaperDeliverDetailForBrand(orderId){
    const url="/api/v1/web_estudio/brand/cell/plan_order/{orderId}/deliver".replace("{orderId}",orderId);
    return await axios.get(url);
}
async function fetchPaperDeliverDetail(orderId){
    const url="/api/v1/web_epod/cell/plan_order/{id}/deliver".replace("{id}",orderId);
    return await axios.get(url);
}
async function doLeaveMessage(dto){
    const url="/api/v1/web_epod/cell/plan_order/deliver/leave_a_message";
    return await axios.put(url,dto);
}
async function doDeliver(orderId,previewFile,deliverFile){

    var fd = new FormData();
    fd.append('preview', previewFile);
    fd.append('deliver',deliverFile);
    fd.append('orderId',orderId);
    const url="/api/v1/web_estudio/cell/plan_order/new_deliver";
    return await axios.post(url,fd);

}
async function doModifyPaperDeliverTag(dto){
    const url="/api/v1/web_epod/cell/plan_order/deliver/tag";
    return await axios.put(url,dto);
}
async function doRefund(dto){
    const url="/api/v1/web_epod/refund";
    return await axios.post(url,dto);
}
async function doRepay(orderId){
   const url = "/api/v1/mall/plan/order/{id}/repay".replace("{id}",orderId);
   return await axios.post(url,{});
}
function repay(){
    const orderId=getQueryVariable("id");
    if(!orderId){
        return;
    }
    return doRepay(orderId);
}
function refund(){
    const orderId=getQueryVariable("id");
    if(!orderId){
        return;
    }
    const dto={
       scene: RefundSceneEnum.CELL_PLAN_ORDER,
       param: JSON.stringify({orderId: orderId})
    }
   return doRefund(dto);
}
function fetchPaperDeliverDetailForBrand(orderId){
    return doFetchPaperDeliverDetailForBrand(orderId);
}
function leaveMessage(deliverId,message){
    const dto={
        msg: message,
        deliverId: deliverId
    }
    return doLeaveMessage(dto);
}
function modifyPaperDeliverTag(tag,deliverId,orderId){
    const dto={
        tag: tag,
        deliverId: deliverId,
        orderId: orderId
    }
    return doModifyPaperDeliverTag(dto);
}
function deliverPaper(){

    const orderId=getQueryVariable("id");
    const preview= $('#inputPreviewFile')[0].files[0];
    const deliver= $('#inputDeliverFile')[0].files[0];

    return doDeliver(orderId,preview,deliver);
}

function doFetchPaperDeliverDetail(orderId){
    return fetchPaperDeliverDetail(orderId);
}
function paperDeliverTagExplain(tag){
    var tagDesc="";
    switch(tag){
        case CommercialPaperDeliverTag.CREATED:
            tagDesc="待验收";
            break; 
        case CommercialPaperDeliverTag.REVISION:
            tagDesc="退回修订";
                break; 
        case CommercialPaperDeliverTag.DELIVERED:
            tagDesc="已交付";
                break; 
    }
    return tagDesc;
}
export default CellPlanOrderDeliverCompoent;