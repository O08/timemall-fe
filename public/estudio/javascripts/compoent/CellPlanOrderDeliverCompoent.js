import axios from "axios";
import { getQueryVariable } from "/common/javascripts/util.js";
import {CommercialPaperDeliverTag} from "/common/javascripts/tm-constant.js";
import {RefundSceneEnum} from "/common/javascripts/tm-constant.js";

import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const CellPlanOrderDeliverCompoent = {
    data() {
        return {
            mpdc__paperDeliver:{},
            focusModal:{
                feed: "",
                confirmHandler:()=>{

                }
            }
        }
    },
    methods: {
        
        showAcceptDeliverFocusModalV(deliver){
            this.focusModal.feed="接受交付后，将解锁服务商的交付资料，同时您的服务款项将打入服务商账户，您可点击 确定 接受交付"
            this.focusModal.confirmHandler=()=>{
                this.acceptPaperDeliverV(deliver);
                $("#focusModal").modal("hide"); // show modal

            };
            $("#focusModal").modal("show"); // show modal
        },
        showRefundFocusModalV(){
            this.focusModal.feed="确定要退款？"
            this.focusModal.confirmHandler=()=>{
                this.refundV();
                $("#focusModal").modal("hide"); // show modal
            }
            $("#focusModal").modal("show"); // show modal
        },
        refundV(){
            refund().then(response=>{
                if(response.data.code==200){
                    this.findPlanDetailV();// from studio-plan.js
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
                    this.findPlanDetailV();// from studio-plan.js
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
            tagDesc="已提交交付内容";
            break; 
        case CommercialPaperDeliverTag.REVISION:
            tagDesc="修订";
                break; 
        case CommercialPaperDeliverTag.DELIVERED:
            tagDesc="已交付";
                break; 
    }
    return tagDesc;
}
export default CellPlanOrderDeliverCompoent;