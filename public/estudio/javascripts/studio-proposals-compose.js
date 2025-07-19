import "/common/javascripts/import-jquery.js";

import 'jquery-ui/ui/widgets/datepicker.js';
import 'jquery-ui/ui/i18n/datepicker-zh-CN.js';

import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"
import axios from 'axios';

import Quill from 'quill';
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.bubble.css';
import 'quill/dist/quill.snow.css';

import {EventFeedScene} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js"
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";

import { transformInputNumberAsPositiveDecimal,transformInputNumberAsPositive } from "/common/javascripts/util.js";


import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();


const fontSizeArr = ['14px', '16px', '18px', '20px', '22px'];
const backgroundArr = [
  "#1a1a1a", "#e60000", "#ff9900", "#ffff00", "#008a00", "#0066cc", "#9933ff",
  "#ffffff", "#facccc", "#ffebcc", "#ffffcc", "#cce8cc", "#cce0f5", "#ebd6ff",
  "#bbbbbb", "#f06666", "#ffc266", "#ffff66", "#66b966", "#66a3e0", "#c285ff",
  "#888888", "#a10000", "#b26b00", "#b2b200", "#006100", "#0047b2", "#6b24b2",
  "#444444", "#5c0000", "#663d00", "#666600", "#003700", "#002966", "#3d1466"
];

var Size = Quill.import('attributors/style/size');
Size.whitelist = fontSizeArr;
Quill.register(Size, true);


const toolbarOptions = [
  [{ 'size': fontSizeArr }],  // custom dropdown
  [{ 'color': [] }, { 'background': backgroundArr }],          // dropdown with defaults from theme
  ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
  [{ 'align': [] }],
  ['blockquote'],
  ['link'],
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
  ['clean']                                         // remove formatting button
];
const quill = new Quill('#editor', {
    modules: {
      toolbar: toolbarOptions
    },
    theme: 'snow'
});



const RootComponent = {
    data() {
        return {
          btn_ctl:{
            general_aready_change: false,
            open_material_upload: false,
            seller_material_uploading: false,
            deliver_material_uploading: false
          },
          materialFileOptions: {
            id: "",
            materialName: "",
            materialType: ""
          },
          sellerMaterialList: [],
          deliverMaterialList: [],
          buyerMaterialList: [],

          proposalGeneral:{
            sellerBrandId: "",
            proposalId: "",
            projectName: "",
            starts: "",
            ends: "",
            services: [
              {
                serviceName: "",
                price: "",
                quantity: ""
              }
            ],
            extraContent: ""
          }
        }
    },
    methods: {

      validateGeneralFormV(){
        return   (!this.proposalGeneral.projectStatus || this.proposalGeneral.projectStatus=='0')&& this.validateServiceAndFeeInfoV() && this.btn_ctl.general_aready_change && !!this.proposalGeneral.projectName && !!this.proposalGeneral.starts && !!this.proposalGeneral.ends; 
      },
      validateServiceAndFeeInfoV(){
        var isValid=false;
        if(this.proposalGeneral.services.length==0){
          return isValid;
        }
       var existsProjectNameIsBlank= this.proposalGeneral.services.some(e=>!e.serviceName);
       if(existsProjectNameIsBlank){
        return isValid;
       }
       var existsQuantityIsBlank= this.proposalGeneral.services.some(e=>!e.quantity);
       if(existsQuantityIsBlank){
        return isValid;
       }
       var existsPriceIsBlank= this.proposalGeneral.services.some(e=>!e.price);
       if(existsPriceIsBlank){
        return isValid;
       }
       var existsPriceIsZero= this.proposalGeneral.services.some(e=>Number(e.price)==0);
       if(existsPriceIsZero){
        return isValid;
       }
       return true;


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
      loadProposalV(){
        loadProposal();
      },
      loadSellerMaterialV(){
        loadMaterialInfo("seller",this.proposalGeneral.proposalId).then(res=>{
            this.sellerMaterialList=res;
        });
      },
      loadBuyerMaterialV(){
          loadMaterialInfo("buyer",this.proposalGeneral.proposalId).then(res=>{
              this.buyerMaterialList=res;
          });
      },
      loadDeliverMaterialV(){
          loadMaterialInfo("deliver",this.proposalGeneral.proposalId).then(res=>{
              this.deliverMaterialList=res;
          });
      },

      composeProposalV(){
        composeProposal(this);
      },

      addOneServiceV(){
        this.proposalGeneral.services.push({
          price:"",
          serviceName:"",
          quantity:""
        })
      },
      removeOneServiceV(index){
        this.proposalGeneral.services.splice(index,1);
        this.btn_ctl.general_aready_change = true;

      },
       
      userInputDatePickerHandlerV(e){    

        if(!e.target.dataset.olddate){
            e.target.dataset.olddate="2022-02-21";
        }
        e.target.value =  e.target.dataset.olddate;
        $("#" + e.target.id).datepicker("setDate", e.target.dataset.olddate);
        if(!!e.data){
            e.currentTarget.dispatchEvent(new Event('input')); // update v-model
        }

      },
      transformInputNumberAsPositiveDecimalV(e){
        return transformInputNumberAsPositiveDecimal(e);
      },
      transformInputNumberAsPositiveV(e){
        return transformInputNumberAsPositive(e);
      }
    },
    created() {
    },
    updated(){
        
      $(function() {
          // Enable popovers 
          $('[data-bs-toggle="popover"]').popover();
      });

      $( ".datepicker" ).datepicker({
        dateFormat: "yy-mm-dd",
        duration: "fast",
        onSelect: function(selectedDate,inst) {
            if(inst.lastVal !=selectedDate){
                document.getElementById(inst.id).dataset.olddate=selectedDate;
                document.getElementById(inst.id).dispatchEvent(new Event('input'))
                document.getElementById(inst.id).dispatchEvent(new Event('change'))
            }
        }
    });
    $( ".datepicker" ).datepicker( $.datepicker.regional[ "zh-CN" ] );

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
                composeProposalPage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);
const composeProposalPage = app.mount('#app');
window.cComposeProposalPage = composeProposalPage;

// init
composeProposalPage.loadProposalV();

async function createNewProposal(dto){
   const url = "/api/v1/web_estudio/brand/proposal/new";
   return await axios.post(url,dto);
}

async function doChangeProposal(dto){
  const url = "/api/v1/web_estudio/brand/proposal/change";
  return await axios.put(url,dto);
}

async function getProposalInfo(proposalNo){
  const url ="/api/v1/web_estudio/brand/proposal/{no}/query".replace("{no}",proposalNo);
  return  await axios.get(url);
}


async function getProposalMaterial(materialType,proposalId){

  const url ="/api/v1/web_estudio/brand/proposal/material/query?materialType="+materialType+"&proposalId="+proposalId;
  return await axios.get(url);

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
async function uploadProposalMaterial(e,materialType){
  if(e.target.files.length === 0){

      customAlert.alert("未选择文件");

      return;
  }

  const materialFile = e.target.files[0];

  // change btn to loading status

  if(materialType=="seller"){
    composeProposalPage.btn_ctl.seller_material_uploading=true; 
  }
  if(materialType=="deliver"){
    composeProposalPage.btn_ctl.deliver_material_uploading=true; 
  }

  await doUploadProposalMaterial(composeProposalPage.proposalGeneral.proposalId,materialFile,materialType).then(response=>{
      if(response.data.code==200){
          if(materialType=="seller"){
            composeProposalPage.loadSellerMaterialV();
          }
          if(materialType=="deliver"){
            composeProposalPage.loadDeliverMaterialV();
          }

      }
      if(response.data.code!=200){
          customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
      }
  }).catch(error=>{
          customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
  });

  if(materialType=="seller"){
    composeProposalPage.btn_ctl.seller_material_uploading=false; 
  }
  if(materialType=="deliver"){
    composeProposalPage.btn_ctl.deliver_material_uploading=false; 
  }

  e.target.value = null;


}

async function renameMaterial(materialFileOptions){
  doRenameMaterial(materialFileOptions).then(response=>{
      if(response.data.code==200){
        if(materialFileOptions.materialType=="seller"){
          composeProposalPage.loadSellerMaterialV();
        }
        if(materialFileOptions.materialType=="deliver"){
          composeProposalPage.loadDeliverMaterialV();
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
          composeProposalPage.loadSellerMaterialV();
        }
        if(materialType=="deliver"){
          composeProposalPage.loadDeliverMaterialV();
        }
      }
      if(response.data.code!=200){
          customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
      }
  }).catch(error=>{
          customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
  });
}

async function newProposal(proposalGeneral){

  if(JSON.stringify(proposalGeneral.services)>4800){
    customAlert.alert("服务与费用超出允许值，需重新调整！")
    return;
  }

    // max length == 10000
    if(quill.getSemanticHTML().length>10000){
      customAlert.alert("条款内容长度超出容量，需重新调整！")
      return;
    }

  const proposal = {
    projectName: proposalGeneral.projectName,
    starts: proposalGeneral.starts,
    ends: proposalGeneral.ends,
    services: JSON.stringify(proposalGeneral.services),
    extraContent: quill.getSemanticHTML()
  }
  createNewProposal(proposal).then(response=>{
    if(response.data.code==200){
      var url = "/proposal/"+ response.data.projectNo + "/compose"
      history.pushState(null, "", url);
      loadCoreProposal();
    }
    if(response.data.code!=200){
        customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
    }
  }).catch(error=>{
        customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
  });
}

async function changeProposal(proposalGeneral){

  if(JSON.stringify(proposalGeneral.services)>4800){
    customAlert.alert("服务与费用超出允许值，需重新调整！")
    return;
  }
   // max length == 10000
   if(quill.getSemanticHTML().length>10000){
    customAlert.alert("条款内容长度超出容量，需重新调整！")
    return;
  }

  const proposal = {
    id: proposalGeneral.proposalId,
    projectName: proposalGeneral.projectName,
    starts: proposalGeneral.starts,
    ends: proposalGeneral.ends,
    services: JSON.stringify(proposalGeneral.services),
    extraContent: quill.getSemanticHTML()
  }
  doChangeProposal(proposal).then(response=>{
    if(response.data.code==200){
      loadCoreProposal();
    }
    if(response.data.code!=200){
        customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
    }
  }).catch(error=>{
        customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
  });
}

async function composeProposal(appObj){
  if(window.location.pathname=="/proposal/compose"){
    newProposal(appObj.proposalGeneral);
  }
  if(window.location.pathname!="/proposal/compose"){
    changeProposal(appObj.proposalGeneral);
  }
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

  if(window.location.pathname=="/proposal/compose"){
    return
  }

  const proposalNo= window.location.pathname.split('/').slice(-2).shift();
  await getProposalInfo(proposalNo).then(response=>{
        if(response.data.code==200){
            const proposal= response.data.proposal;
            composeProposalPage.proposalGeneral={
              proposalId: proposal.id,
              sellerBrandId: proposal.sellerBrandId,
              projectName: proposal.projectName,
              starts: proposal.projectStarts,
              ends: proposal.projectEnds,
              services: proposal.services,
              extraContent: proposal.extraContent,
              projectStatus: proposal.projectStatus
            };
            // editor
            quill.root.innerHTML = '';
            quill.clipboard.dangerouslyPasteHTML(0, proposal.extraContent);  
            // active upload btn
            composeProposalPage.btn_ctl.open_material_upload=true;
            composeProposalPage.btn_ctl.general_aready_change = false;

        }
        if(response.data.code!=200){
            customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
        }
    }).catch(error=>{
            customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
    });

}

async function loadProposal(){
  if(window.location.pathname=="/proposal/compose"){
    return
  }
  await loadCoreProposal();
  composeProposalPage.loadSellerMaterialV();

}



quill.on('text-change', () => {
  composeProposalPage.btn_ctl.general_aready_change = true;
});


$(function(){
	$(".tooltip-nav").tooltip();
});