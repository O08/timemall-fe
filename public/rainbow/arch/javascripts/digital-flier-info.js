import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"

import axios from "axios";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import {goErrorByReplace,goLoginPage} from "/common/javascripts/pagenav.js";
import { CodeExplainComponent } from "/common/javascripts/compoent/code-explain-compoent.js";


import { copyValueToClipboard } from "/common/javascripts/share-util.js";

import {EnvWebsite,CodeMappingTypeEnum} from "/common/javascripts/tm-constant.js";

import { formatCmpctNumber } from "/common/javascripts/util.js";


import Pagination  from "/common/javascripts/pagination-vue.js";

import {DspReportApi} from "/common/javascripts/dsp-report-api.js";

import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const currentFlierId = window.location.pathname.split('/').pop();


const currentDomain = window.location.hostname === 'localhost' ? EnvWebsite.LOCAL : EnvWebsite.PROD;

const FlierInteractEventEnum=Object.freeze({
  "RECEIVER_LIKE": "receiver_like",  
  "RECEIVER_CTA_CLICK": "receiver_cta_click",
  "VISITOR_LIKE": "visitor_like",
  "VISITOR_CTA_CLICK": "visitor_cta_click"
}); 

const RootComponent = {
    data() {
      return {
        reportOptions: [],
        reportForm: this.initReportForm(),

        init_finish: false,
        flier: {}
      }
    },
    methods: {
      copyValueToClipboardV(flierId){
        const copyContent=currentDomain+"/flier/"+flierId;
        copyValueToClipboard(copyContent);
      },
      openCtaLinkV(flier){
        if(!flier.ctaLink) return ;
        if(!this.user_already_login || flier.hasClickCta == '1') {
          this.openLinkV(flier.ctaLink);
          return;
        }
        visitorFlierInteract(flier.flierId,FlierInteractEventEnum.VISITOR_CTA_CLICK).then(response => {
       
          if (response.data.code == 200) {
            flier.hasClickCta='1';
            this.openLinkV(flier.ctaLink);
          }

          if (response.data.code != 200) {
              const error = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message;
              customAlert.alert(error);
          }
         }).catch(error => {
           customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
         });

      },
      receiverFlierLikeInteractV(flier){
        if (!this.checkLoginStatusV()) return;
        if(flier?.hasLike=='1') return;
        visitorFlierInteract(flier.flierId,FlierInteractEventEnum.VISITOR_LIKE).then(response => {
       
          if (response.data.code == 200) {
            flier.likes = (Number(flier.likes) || 0) + 1;
            flier.hasLike='1';
          }

          if (response.data.code != 200) {
              const error = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message;
              customAlert.alert(error);
          }
       }).catch(error => {
           customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
       });
      },
      openLinkV(linkUrl){
        window.open(linkUrl, '_blank');
      },
      loadFlierInfoInfoV(){
        const visitorBrandId = this.getIdentity().brandId;
        loadFlierInfo(currentFlierId,visitorBrandId).then(response => {
          if (response.data.code == 40043 ) {
              goErrorByReplace();
              return
          }
          if (response.data.code == 200) {
              this.flier = response.data.flier;

              var title = !response.data.flier?.title ? "传单信息" : response.data.flier?.title ;
              document.title = title + " | bluvarri.com";

              this.init_finish=true;
          }

          if (response.data.code != 200) {
              const error = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message;
              customAlert.alert(error);
          }
        }).catch(error => {
          customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
        });
      },

      checkLoginStatusV(){
        if (!this.user_already_login) {
          goLoginPage();
          return false;
        }
        return true;  
      },

      formatCmpctNumberV(number){
        if(!number || Number(number)==0){
          return "0";
        }

        return formatCmpctNumber(Number(number));
      },
      newReportCaseV(){
        newReportCase(this.reportForm).then(response=>{
            if(response.data.code==200){

              customAlert.alert("举报/投诉记录已追加到档案库，可通过【个人中心】-【争端解决】了解最新的处理情况");

              document.querySelector('#caseMaterialFile').value = null;
  
              this.closeOasisReportModalV();

            }
            if(response.data.code!=200){
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
            }
        })
      },
      closeOasisReportModalV(){         
          $("#reportOasisModal").modal("hide");
      },
      showOasisReportModalV(flier){

        if (!this.checkLoginStatusV()) return;

        this.reportForm={
              fraudType: "",
              scene: "数字传单",
              sceneUrl: currentDomain+"/flier/"+flier.flierId,
              caseDesc: "",
              material: ""
          }

          if(!!document.querySelector('#caseMaterialFile') && !!document.querySelector('#caseMaterialFile').value ){
            document.querySelector('#caseMaterialFile').value = null;
          }
          

          showOasisReportModal(         
              this.loadReportIssueListV
          );
      },
      loadReportIssueListV(){
          loadReportIssueList(this);
      },
      validateReportFormV(){
        return !!this.reportForm.caseDesc && !!this.reportForm.fraudType;
      },
      initReportForm(){

        if(!!document.querySelector('#caseMaterialFile') && !!document.querySelector('#caseMaterialFile').value ){
           document.querySelector('#caseMaterialFile').value = null;
        }

        return {
            fraudType: "",
            scene: "数字传单",
            sceneUrl: "",
            caseDesc: "",
            material: ""
        }
      },
    }
}
let app =  createApp(RootComponent);
app.mixin(new Auth({need_permission : false,need_init: true}));
app.mixin(DirectiveComponent);
app.mixin(ImageAdaptiveComponent);
app.mixin(CodeExplainComponent);
app.mixin(Pagination);

const digitalFlierInfo = app.mount('#app');

window.digitalFlierInfoPage = digitalFlierInfo;


digitalFlierInfo.loadFlierInfoInfoV();


async function doFetchFlierInfo(flierId,visitorBrandId){
  const url="/api/open/web_estudio/flier/visitor/info?flierId="+flierId+"&visitorBrandId="+visitorBrandId;
  return await axios.get(url);
}

async function flierInteract(dto){
  const url="/api/v1/web_estudio/flier/interact";
  return await axios.post(url,dto);
}

async function visitorFlierInteract(flierId,event){
  const dto={
    flierId: flierId,
    event: event
  }

  return await flierInteract(dto);
}

async function loadFlierInfo(flierId,visitorBrandId){
  return await doFetchFlierInfo(flierId,visitorBrandId);
}





// report feature


async function newReportCase(reportForm) {

  const materialFile = $('#caseMaterialFile')[0].files[0];

  var form = new FormData();
  if (!!materialFile) {
      form.append("material", materialFile);
  }
  form.append("fraudType", reportForm.fraudType);
  form.append("scene", reportForm.scene);
  form.append("sceneUrl", reportForm.sceneUrl);
  form.append("caseDesc", reportForm.caseDesc);
  return await DspReportApi.addNewReportCase(form);

}
async function loadReportIssueList(appObj) {
  const response = await DspReportApi.fetchCodeList(CodeMappingTypeEnum.REPORTISSUE, "");
  var data = await response.json();
  if (data.code == 200) {

      appObj.reportOptions = data.codes.records;

  }
}

async function showOasisReportModal(loadReportIssueListV) {
  await loadReportIssueListV();
  $("#reportOasisModal").modal("show");
}

// report feature end






