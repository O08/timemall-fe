import axios from "axios";
import { getQueryVariable } from "/common/javascripts/util.js";
import {CommercialPaperDeliverTag} from "/common/javascripts/tm-constant.js";

import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const CommissionWSDeliverCompoent = {
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
            this.focusModal.feed="接受交付后，将解锁服务商的交付资料，同时您管理的部落负债项将增加，服务服务商有权从您管理的部落收账，您可点击 「确定」 接受交付"
            this.focusModal.confirmHandler=()=>{
                this.acceptPaperDeliverV(deliver);
                $("#focusModal").modal("hide"); // show modal

            };
            $("#focusModal").modal("show"); // show modal
        },
        closeDeliverPaperModalHandlerV(){
            //reset input file
            resetDeliverModal();

        },
        showAddNewDeliverModalV(){
            resetDeliverModal();
            // reset variable in  commission-ws.js
            this.uploadingDeliverMaterial=false;
            this.deliverFileSizeExceeded=false;
            this.delieverOrPreviewFileIsEmpty=true;
            this.previewFileSizeExceeded=false;
            this.previewFileSelected=false;
            this.deliverFileSelected=false;
            this.previewFileName='';
            this.deliverFileName='';
            $("#newDeliverModal").modal("show"); // show modal
        },
        fetchPaperDeliverDetailV(){
            const commissionId=getQueryVariable("id");
            doFetchPaperDeliverDetail(commissionId).then(response=>{
                if(response.data.code==200){
                    this.mpdc__paperDeliver=response.data.deliver;
                }
            })
        },
        deliverPaperV(){
            this.uploadingDeliverMaterial=true;
            deliverPaper().then(response=>{
                this.uploadingDeliverMaterial=false;
                if(response.data.code==200){
                    $("#newDeliverModal").modal("hide"); // hide modal
                    this.fetchPaperDeliverDetailV();
                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error);
                }
            }).catch(error=>{
                this.uploadingDeliverMaterial=false;
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
            });
        },
        leaveMessageV(deliver){
            leaveMessage(deliver.deliverId,deliver.newMsg,deliver.commissionId).then(response=>{
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
            if(!deliver.commissionId){
                deliver.commissionId=getQueryVariable("id");
            }
           modifyPaperDeliverTag(CommercialPaperDeliverTag.REVISION,deliver.deliverId,deliver.commissionId).then(response=>{
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
            if(!deliver.commissionId){
                deliver.commissionId=getQueryVariable("id");
            }
            summitCommission(deliver.commissionId, deliver.deliverId).then(response=>{
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
        },
        taskInConfirmIngV(){
          return   this.mpdc__paperDeliver.records.filter(e=>e.tag==CommercialPaperDeliverTag.CREATED).length>0;
        }
    }

}

async function fetchPaperDeliverDetail(id){
    const url="/api/v1/team/commission_ws/{commission_id}/deliver".replace("{commission_id}",id);
    return await axios.get(url);
}
async function doLeaveMessage(dto){
    const url="/api/v1/team/commission_ws/deliver/leave_a_message";
    return await axios.put(url,dto);
}
async function finishCommission(dto){
    const url ="/api/v1/team/commission/finish";
    return axios.put(url,dto);
}
async function doDeliver(commissionId,previewFile,deliverFile){

    var fd = new FormData();
    fd.append('preview', previewFile);
    fd.append('deliver',deliverFile);
    fd.append('commissionId',commissionId);
    const url="/api/v1/team/commission_ws/new_deliver";
    return await axios.post(url,fd);

}
async function doModifyPaperDeliverTag(dto){
    const url="/api/v1/team/commission_ws/deliver/tag";
    return await axios.put(url,dto);
}
function summitCommission(commissionId,deliverId){
     const dto = {
        commissionId: commissionId,
        deliverId: deliverId
    }
    return finishCommission(dto);
}
function leaveMessage(deliverId,message,commissionId){
    const dto={
        msg: message,
        deliverId: deliverId,
        commissionId: commissionId
    }
    return doLeaveMessage(dto);
}
function modifyPaperDeliverTag(tag,deliverId,commissionId){
    const dto={
        tag: tag,
        deliverId: deliverId,
        commissionId: commissionId
    }
    return doModifyPaperDeliverTag(dto);
}
function deliverPaper(){

    const commissionId=getQueryVariable("id");
    const preview= $('#inputPreviewFile')[0].files[0];
    const deliver= $('#inputDeliverFile')[0].files[0];

    return doDeliver(commissionId,preview,deliver);
}

function doFetchPaperDeliverDetail(commissionId){
    return fetchPaperDeliverDetail(commissionId);
}
function paperDeliverTagExplain(tag){
    var tagDesc="";
    switch(tag){
        case CommercialPaperDeliverTag.CREATED:
            tagDesc="待验收";
            break; 
        case CommercialPaperDeliverTag.REVISION:
            tagDesc="退回";
                break; 
        case CommercialPaperDeliverTag.DELIVERED:
            tagDesc="已交付";
                break; 
    }
    return tagDesc;
}
function resetDeliverModal(){
    //reset input file
    document.querySelector('#inputPreviewFile').value = null;
    document.querySelector('#inputDeliverFile').value = null;
}
export default CommissionWSDeliverCompoent;