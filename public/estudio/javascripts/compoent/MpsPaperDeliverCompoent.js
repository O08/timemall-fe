import axios from "axios";
import { getQueryVariable } from "/common/javascripts/util.js";
import {CommercialPaperDeliverTag} from "/common/javascripts/tm-constant.js";



const MpsPaperDeliverCompoent = {
    data() {
        return {
            mpdc__paperDeliver:{},
            mpdc__current_active_paper: ""
        }
    },
    methods: {
        closeDeliverPaperModalHandlerV(){
            //reset input file
            document.querySelector('#inputPreviewFile').value = null;
            document.querySelector('#inputDeliverFile').value = null;

        },
        showAddNewDeliverModalV(){
            $("#newDeliverModal").modal("show"); // show modal
        },
        fetchPaperDeliverDetailV(paperId){
            this.mpdc__current_active_paper=paperId;
            doFetchPaperDeliverDetail(paperId).then(response=>{
                if(response.data.code==200){
                    this.mpdc__paperDeliver=response.data.deliver;
                }
            })
        },
        doFetchPaperDeliverDetailV(){
            const paperId=getQueryVariable("paper_id");
            if(!paperId){
                return;
            }
            fetchPaperDeliverDetailForBrand(paperId).then(response=>{
                if(response.data.code==200){
                    this.mpdc__paperDeliver=response.data.deliver;
                }
            })
        },
        deliverPaperV(){
            deliverPaper().then(response=>{
                if(response.data.code==200){
                    $("#newDeliverModal").modal("hide"); // hide modal
                    this.doFetchPaperDeliverDetailV();
                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    alert(error);
                }
            }).catch(error=>{
                alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
            });
        },
        leaveMessageV(deliver){
            leaveMessage(deliver.deliverId,deliver.newMsg).then(response=>{
                if(response.data.code==200){
                    deliver.msg = deliver.newMsg
                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    alert(error); 
                }
            }).catch(error=>{
                alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
            });
        },
        revisionPaperDeliverV(deliver){
           modifyPaperDeliverTag(CommercialPaperDeliverTag.REVISION,deliver.deliverId,deliver.paperId).then(response=>{
                if(response.data.code==200){
                    deliver.tag = CommercialPaperDeliverTag.REVISION

                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    alert(error);        
                }
            }).catch(error=>{
                alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
            });
        },
        acceptPaperDeliverV(deliver){
            modifyPaperDeliverTag(CommercialPaperDeliverTag.DELIVERED,deliver.deliverId,deliver.paperId).then(response=>{
                if(response.data.code==200){
                    deliver.tag = CommercialPaperDeliverTag.DELIVERED
                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    alert(error);

                }
            }).catch(error=>{
                alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
            });
        },
        paperDeliverTagExplainV(tag){
           return paperDeliverTagExplain(tag);
        }
    }

}
async function doFetchPaperDeliverDetailForBrand(paperId){
    const url="/api/v1/web_estudio/brand/mps_paper/{paper_id}/deliver".replace("{paper_id}",paperId);
    return await axios.get(url);
}
async function fetchPaperDeliverDetail(paperId){
    const url="/api/v1/web_estudio/mps_paper/{paper_id}/deliver".replace("{paper_id}",paperId);
    return await axios.get(url);
}
async function doLeaveMessage(dto){
    const url="/api/v1/web_estudio/brand/paper_deliver/leave_a_message";
    return await axios.put(url,dto);
}
async function doDeliver(paperId,previewFile,deliverFile){

    var fd = new FormData();
    fd.append('preview', previewFile);
    fd.append('deliver',deliverFile);
    fd.append('paperId',paperId);
    const url="/api/v1/web_estudio/brand/mps/new_deliver";
    return await axios.post(url,fd);

}
async function doModifyPaperDeliverTag(dto){
    const url="/api/v1/web_estudio/mps_paper_deliver/tag";
    return await axios.put(url,dto);
}
function fetchPaperDeliverDetailForBrand(paperId){
    return doFetchPaperDeliverDetailForBrand(paperId);
}
function leaveMessage(deliverId,message){
    const dto={
        msg: message,
        deliverId: deliverId
    }
    return doLeaveMessage(dto);
}
function modifyPaperDeliverTag(tag,deliverId,paperId){
    const dto={
        tag: tag,
        deliverId: deliverId,
        paperId: paperId
    }
    return doModifyPaperDeliverTag(dto);
}
function deliverPaper(){

    const paperId=getQueryVariable("paper_id");
    const preview= $('#inputPreviewFile')[0].files[0];
    const deliver= $('#inputDeliverFile')[0].files[0];

    return doDeliver(paperId,preview,deliver);
}

function doFetchPaperDeliverDetail(paperId){
    return fetchPaperDeliverDetail(paperId);
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
export default MpsPaperDeliverCompoent;