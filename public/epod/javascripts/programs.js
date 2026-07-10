import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"

import axios from "axios";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import {goErrorByReplace} from "/common/javascripts/pagenav.js";
import { CodeExplainComponent } from "/common/javascripts/compoent/code-explain-compoent.js";


import { copyValueToClipboard } from "/common/javascripts/share-util.js";

import {EnvWebsite,CodeMappingTypeEnum} from "/common/javascripts/tm-constant.js";

import Pagination  from "/common/javascripts/pagination-vue.js";

import { Ftime,formatCmpctNumber } from "/common/javascripts/util.js";

import {DspReportApi} from "/common/javascripts/dsp-report-api.js";


import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const programId = window.location.pathname.split('/').pop();


const currentDomain = window.location.hostname === 'localhost' ? EnvWebsite.LOCAL : EnvWebsite.PROD;

const RootComponent = {
    data() {
      return {
        init_finish: false,

        isSubmitting: false,

        reportOptions: [],
        reportForm: this.initReportForm(),

        applicationReqObj:{
          message: "",
          programId: ""
        },
        previewProgram: {
            topics: [],
            applied: ""
        }
    }
    },
    methods: {
      shareProgramV(programId){
        const programUrl=  currentDomain+"/program/"+programId;
        copyValueToClipboard(programUrl);
      },
      applyProgramV(){
        if(this.isSubmitting) return ;
        this.isSubmitting=true;
        this.applicationReqObj.programId=this.previewProgram.programId;
        applyProgram(this.applicationReqObj).then(response=>{
          if(response.data.code==200){
              this.previewProgram.applied='1';
              customAlert.alert("申请成功，可前往【个人中心】-【自由合作】查看申请审核状态");
          }
          if(response.data.code!=200){
              customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
          }
        }).catch(error=>{
            customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
        }).finally(() => {
          this.isSubmitting = false;
        });
      },
        formateDateV(dateStr){
            var timespan = (new Date(dateStr)).getTime()/1000;
            return Ftime(timespan);
        },
        formatCmpctNumberV(number){
            if(!number || Number(number)==0){
              return "0";
            }
  
            return formatCmpctNumber(Number(number));
        },
        loadProgramInfoV(){
            loadProgramInfo(programId).then(response=>{
                if(response.data.code == 200){
                    const result=response.data.program;


                    if(!result){
                        goErrorByReplace();
                        return;
                    }

                    this.previewProgram=response.data.program;

                    document.title = result.title + " | bluvarri.com";

                    this.init_finish=true;
                }
           });
        },
        copyTextV(text){
            copyValueToClipboard(text);
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
        showOasisReportModalV(program){
  
            this.reportForm={
                fraudType: "",
                scene: "自由合作",
                sceneUrl: currentDomain+"/program/"+program.programId,
                caseDesc: "",
                material: ""
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
              scene: "自由合作",
              sceneUrl: "",
              caseDesc: "",
              material: ""
          }
        },
    }
}
let app =  createApp(RootComponent);
app.mixin(new Auth({need_permission : true,need_init: true}));
app.mixin(DirectiveComponent);
app.mixin(ImageAdaptiveComponent);
app.mixin(CodeExplainComponent);
app.mixin(Pagination);

const programInfo = app.mount('#app');

window.programInfoPage = programInfo;

//init
programInfo.loadProgramInfoV();

async function doFetchProgramInfo(programId){
    const url ="/api/v1/web_pod/cooperation/program/{id}/info".replace("{id}",programId);
    return await axios.get(url);
}

async function doApplyProgram(dto){
  const url="/api/v1/web_pod/cooperation/program/apply_for";
  return await axios.post(url,dto);
}

async function applyProgram(dto){
  return await doApplyProgram(dto);
}

async function loadProgramInfo(programId){
    return await doFetchProgramInfo(programId);
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
  $("#commericalOrderPreviewModal").modal("hide");
  $("#reportOasisModal").modal("show");
}

// report feature end
