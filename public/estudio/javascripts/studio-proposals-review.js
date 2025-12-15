import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"
import axios from 'axios';

import {EventFeedScene} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import {CodeExplainComponent} from "/common/javascripts/compoent/code-explain-compoent.js";

import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const RootComponent = {
    data() {
        return {
            btn_ctl:{
                seller_material_uploading: false,
                deliver_material_uploading: false,
                buyer_material_uploading: false
            },
            materialFileOptions: {
                id: "",
                materialName: ""
            },
            focusModal:{
                message: "",
                confirmHandler:()=>{
      
                }
            },
            proposal: {},
            sellerMaterialList: [],
            deliverMaterialList: [],
            buyerMaterialList: []
        }
    },
    methods: {

        getStatusBadgeClassV(status){
            // 0: pending, 1: signed, 2: completed, 3: cancelled
            const statusMap = {
                '0': 'status-pending',
                '1': 'status-signed',
                '2': 'status-delivering',
                '3': 'status-completed',
                '4': 'status-cancelled'
            };
            return statusMap[status] || 'status-pending';
        },
        
        loadProposalV(){
            loadProposal();
        },
        loadSellerMaterialV(){
           loadMaterialInfo("seller",this.proposal.id).then(res=>{
               this.sellerMaterialList=res;
           });
        },
        loadBuyerMaterialV(){
            loadMaterialInfo("buyer",this.proposal.id).then(res=>{
                this.buyerMaterialList=res;
            });
        },
        loadDeliverMaterialV(){
            loadMaterialInfo("deliver",this.proposal.id).then(res=>{
                this.deliverMaterialList=res;
            });
        },
        uploadProposalMaterialV(e,materialType){
            uploadProposalMaterial(e,materialType);
        },
        delOneMaterialV(materialId,materialType){
            delOneMaterial(materialId,materialType);
        },
        showMaterialRenameModalV(materialId,materialType){
            this.materialFileOptions.id= materialId;
            this.materialFileOptions.materialName="";
            this.materialFileOptions.materialType=materialType;
            $("#renameMaterialModal").modal("show"); // show modal
        },
        renameMaterialV(){
            renameMaterial(this.materialFileOptions);
        },
        showSignFocusModalV(){
            this.focusModal.message="注意，提案一经签订，不再支持修订，签订前需仔细检查提案条款、费用等信息！";
            this.focusModal.confirmHandler=()=>{
                signProposal()
            }
            $("#focusModal").modal("show"); // show modal
        }
    },
    created() {
    }
}
const app = createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : false,
    scene: EventFeedScene.STUDIO}));
app.mixin(ImageAdaptiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('content')
}
app.mixin(new FriendListCompoent({need_init: true}));
app.mixin(DirectiveComponent);
app.mixin(
    new Ssecompoent({
        sslSetting:{
            need_init: true,
            onMessage: (e)=>{
                reviewProposalPage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);
app.mixin(CodeExplainComponent);

const reviewProposalPage = app.mount('#app');
window.cReviewProposalPage = reviewProposalPage;

// init
reviewProposalPage.loadProposalV();


async function getProposalInfo(proposalNo){
    const url ="/api/v1/web_estudio/brand/proposal/{no}/query".replace("{no}",proposalNo);
    return  await axios.get(url);
}


async function getProposalMaterial(materialType,proposalId){

    const url ="/api/v1/web_estudio/brand/proposal/material/query?materialType="+materialType+"&proposalId="+proposalId;
    return await axios.get(url);

}

async function doSignProposal(proposalId){
    const url = "/api/v1/web_pod/me/proposal/{id}/sign".replace("{id}",proposalId);
    return await axios.put(url,{});
}
async function doDelOneMaterial(materialId){
    const url ="/api/v1/web_estudio/brand/proposal/material/{id}/del".replace("{id}",materialId);
    return await axios.delete(url);
}
async function doRenameMaterial(dto){
    const url ="/api/v1/web_estudio/brand/proposal/material/rename";
    return await axios.put(url,dto);
}
async function doUploadProposalMaterial(proposalId,materialFile,materialType){
    var form = new FormData();
    form.append("material",materialFile);
    form.append("materialType",materialType);
    form.append("proposalId",proposalId);
    const url ="/api/v1/web_estudio/brand/proposal/material/upload";
    return await axios.post(url,form);
}

async function renameMaterial(materialFileOptions){
    doRenameMaterial(materialFileOptions).then(response=>{
        if(response.data.code==200){

            if(materialFileOptions.materialType=="seller"){
                reviewProposalPage.loadSellerMaterialV();
            }
            if(materialFileOptions.materialType=="deliver"){
                reviewProposalPage.loadDeliverMaterialV();
            }
            if(materialFileOptions.materialType=="buyer"){
               reviewProposalPage.loadBuyerMaterialV();
            }
            $("#renameMaterialModal").modal("hide"); // hide modal

        }
        if(response.data.code!=200){
            customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
        }
    }).catch(error=>{
            customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
    });
}
async function delOneMaterial(materialId,materialType){
    doDelOneMaterial(materialId).then(response=>{
        if(response.data.code==200){
          if(materialType=="seller"){
            reviewProposalPage.loadSellerMaterialV();
          }
          if(materialType=="deliver"){
            reviewProposalPage.loadDeliverMaterialV();
          }
          if(materialType=="buyer"){
            reviewProposalPage.loadBuyerMaterialV();
          }
        }
        if(response.data.code!=200){
            customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
        }
    }).catch(error=>{
            customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
    });
}
async function signProposal(){
    await doSignProposal(reviewProposalPage.proposal.id).then(response=>{
        if(response.data.code==200){
            loadCoreProposal();
            $("#focusModal").modal("hide"); // hide modal

        }
        if(response.data.code!=200){
            customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
        }
    }).catch(error=>{
            customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
    });
}

async function uploadProposalMaterial(e,materialType){
    if(e.target.files.length === 0){
  
        customAlert.alert("未选择文件");
  
        return;
    }
  
    const materialFile = e.target.files[0];
  
    // change btn to loading status
  
    if(materialType=="seller"){
      reviewProposalPage.btn_ctl.seller_material_uploading=true; 
    }
    if(materialType=="deliver"){
      reviewProposalPage.btn_ctl.deliver_material_uploading=true; 
    }
    if(materialType=="buyer"){
        reviewProposalPage.btn_ctl.buyer_material_uploading=true; 
    }
  
    await doUploadProposalMaterial(reviewProposalPage.proposal.id,materialFile,materialType).then(response=>{
        if(response.data.code==200){
            if(materialType=="seller"){
              reviewProposalPage.loadSellerMaterialV();
            }
            if(materialType=="deliver"){
              reviewProposalPage.loadDeliverMaterialV();
            }
            if(materialType=="buyer"){
                reviewProposalPage.loadBuyerMaterialV();
            }
  
        }
        if(response.data.code!=200){
            customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
        }
    }).catch(error=>{
            customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
    });
  
    if(materialType=="seller"){
      reviewProposalPage.btn_ctl.seller_material_uploading=false; 
    }
    if(materialType=="deliver"){
      reviewProposalPage.btn_ctl.deliver_material_uploading=false; 
    }
    if(materialType=="buyer"){
        reviewProposalPage.btn_ctl.buyer_material_uploading=false; 
    }
  
    e.target.value = null;
  
  
}

async function loadMaterialInfo(materialType,proposalId){
    var materialRecords= [];
    await getProposalMaterial(materialType,proposalId).then(response=>{
        if(response.data.code==200){
           materialRecords=response.data.materials;
        }
        if(response.data.code!=200){
            customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
        }
    }).catch(error=>{
            customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
    });
    return materialRecords;
}
async function loadCoreProposal(){
    const proposalNo= window.location.pathname.split('/').pop();
   await getProposalInfo(proposalNo).then(response=>{
        if(response.data.code==200){
            reviewProposalPage.proposal=!response.data.proposal ? {} : response.data.proposal;
        }
        if(response.data.code!=200){
            customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
        }
    }).catch(error=>{
            customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
    });
 
}

async function loadProposal(){
    await loadCoreProposal();
    reviewProposalPage.loadSellerMaterialV();
    reviewProposalPage.loadBuyerMaterialV();
    reviewProposalPage.loadDeliverMaterialV();
}


$(function(){
	$(".tooltip-nav").tooltip();
});