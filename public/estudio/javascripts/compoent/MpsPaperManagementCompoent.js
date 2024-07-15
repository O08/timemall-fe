import axios from 'axios';
import {CommercialPaperTag} from "/common/javascripts/tm-constant.js";

import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();
const MpsPaperManagementCompoent = {
    data() {
        return {
            btn_ctl: {
                activate_edit_mps_save_btn: false
            },
            mpmc__paperDetail: {},
            mpmc_putPaper: {
                sow: "",
                bonus: "",
                paperId: ""
            }
        }
    },
    methods: {
        paperAlreadyInvalidV(){
          return  (Date.parse(this.mpmc__paperDetail.modifiedAt) + (Number(this.mpmc__paperDetail.contractValidityPeriod) * (1000 * 3600 * 24)))  < new Date().getTime()
        },
        closeEditPaperModalHandlerV(){
            this.btn_ctl.activate_edit_mps_save_btn=false;
        },
        validatePutTemplateV(){
            if(!!this.mpmc_putPaper.sow && !!this.mpmc_putPaper.bonus 
                && !!this.mpmc_putPaper.paperId){

                return true;
            }
            return false;
        },

        showEditPaperModelV(){
            $("#editPaperModal").modal("show"); // show modal
            this.mpmc_putPaper.sow=this.mpmc__paperDetail.sow;
            this.mpmc_putPaper.bonus=Number(this.mpmc__paperDetail.bonus).toFixed(0);
            this.mpmc_putPaper.paperId=this.mpmc__paperDetail.paperId;

        },
        modifyMpsPaperV(){
            modifyMpsPaper(this.mpmc_putPaper).then(response=>{
                if(response.data.code==200){
                    $("#editPaperModal").modal("hide"); // hide modal
                    this.findPaperDetailV(this.mpmc_putPaper.paperId);
                }
                if(response.data.code!=200){
                    customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
                }
            }).catch(error=>{
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
            });
        },
        onlineMpsPaperV(paperId){
            taggingMpsPaper(CommercialPaperTag.PUBLISH,paperId).then(response=>{
                if(response.data.code==200){
                    this.findPaperDetailV(paperId);
                }
            });
        },
        offLineMpsPaperV(paperId){
            taggingMpsPaper(CommercialPaperTag.OFFLINE,paperId).then(response=>{
                if(response.data.code==200){
                    this.findPaperDetailV(paperId);
                }
            });
        },
        
        findPaperDetailV(paperId){
            findPaperDetail(paperId).then(response=>{
                if(response.data.code==200){
                    this.mpmc__paperDetail=response.data.detail;
                }
            })
        },
        explainPaperTagV(tag){
            return explainPaperTag(tag);
        },
        paperProgressColorV(tag){
         return paperProgressColor(tag);
        }
    }
}
async function updateMpsPaper(dto){
    const url="/api/v1/web_estudio/brand/mps_paper";
    return await axios.put(url,dto);
}
async function tagMpsPaper(dto){
    const url="/api/v1/web_estudio/mps_paper/tag";
    return await axios.put(url,dto);
}
async function fetchPaperDetail(paperId){
  const url="/api/v1/web_estudio/commercial_paper/{id}/detail".replace("{id}",paperId);
  return await axios.get(url);
}



function modifyMpsPaper(dto){
    return updateMpsPaper(dto);
}
function taggingMpsPaper(tag,paperId){
    const dto={
        tag: tag,
        paperId : paperId,
    }
  return tagMpsPaper(dto);
}
function findPaperDetail(paperId){
    return fetchPaperDetail(paperId);
}
function explainPaperTag(paperTag){
    var paperTagDesc="";
    switch(paperTag){
        case CommercialPaperTag.CREATED:
            paperTagDesc="新建";
            break; 
        case CommercialPaperTag.PUBLISH:
            paperTagDesc="招商中";
                break; 
        case CommercialPaperTag.OFFLINE:
            paperTagDesc="已停止";
            break; 
        case CommercialPaperTag.END:
            paperTagDesc="已完成";
                break; 
        case CommercialPaperTag.DELIVERING:
            paperTagDesc="交付中";
                break; 
        case CommercialPaperTag.CLOSED:
            paperTagDesc="已关单";
                break; 
    }
    return paperTagDesc;
}

function paperProgressColor(paperTag){
    var paperProgressColor="unset";
    switch(paperTag){
        case CommercialPaperTag.CREATED:
            paperProgressColor="unset";
            break; 
        case CommercialPaperTag.PUBLISH:
            paperProgressColor="unset";
                break; 
        case CommercialPaperTag.OFFLINE:
            paperProgressColor="unset";
            break; 
        case CommercialPaperTag.END:
            paperProgressColor="#FD820B";
                break; 
        case CommercialPaperTag.DELIVERING:
            paperProgressColor="#4CFFA9";
                break; 
        case CommercialPaperTag.CLOSED:
            paperProgressColor="#FD820B";
                break; 
    }
    return paperProgressColor;
}


export default MpsPaperManagementCompoent;