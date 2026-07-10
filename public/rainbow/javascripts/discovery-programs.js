import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"
import Pagination  from "/common/javascripts/pagination-vue.js";

import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js';
import { copyValueToClipboard } from "/common/javascripts/share-util.js";
import {EnvWebsite,CodeMappingTypeEnum} from "/common/javascripts/tm-constant.js";
import axios from "axios";
import {CodeExplainComponent} from "/common/javascripts/compoent/code-explain-compoent.js";
import {DspReportApi} from "/common/javascripts/dsp-report-api.js";
import { Ftime,formatCmpctNumber } from "/common/javascripts/util.js";

import { DirectiveComponent } from "/common/javascripts/custom-directives.js";

import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const currentDomain = window.location.hostname === 'localhost' ? EnvWebsite.LOCAL : EnvWebsite.PROD;



const RootComponent = {
    data() {
        return {

          reportOptions: [],
          reportForm: this.initReportForm(),

          workModeOptions: [
            { label: '全部', value: '' },
            { label: '全职', value: 'full_time' },
            { label: '兼职', value: 'part_time' },
            { label: '无限制', value: 'flexible' }
          ],
          currentWorkModeFilter: "",

            applicationReqObj:{
              message: "",
              programId: ""
            },
            previewProgram:{
              topics: []
            },
            programgrid_pagination: {
                url: "/api/v1/web_pod/discovery/cooperation/programs",
                size: 2,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                    q: '',
                    workMode: '',
                    sort: '1'
                },
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.programgrid_pagination.size = response.program.size;
                        this.programgrid_pagination.current = response.program.current;
                        this.programgrid_pagination.total = response.program.total;
                        this.programgrid_pagination.pages = response.program.pages;
                        this.programgrid_pagination.records = response.program.records;
                        this.programgrid_pagination.paging = this.doPaging({current: response.program.current, pages: response.program.pages, size: 5});

                    }
                }
            }
        }
    },
    methods: {
        applyProgramV(){
          this.applicationReqObj.programId=this.previewProgram.programId;
          applyProgram(this.applicationReqObj).then(response=>{
            if(response.data.code==200){
                
                this.closeJoinModalV();
                customAlert.alert("申请成功，可前往【个人中心】-【自由合作】查看项目申请状态");
                this.reloadPage(this.programgrid_pagination);
            }
            if(response.data.code!=200){
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
            }
          }).catch(error=>{
              customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
          });
        },
        shareProgramV(programId){
          const programUrl=  currentDomain+"/program/"+programId;
          copyValueToClipboard(programUrl);
        },
        warmupProgramV(programId){
            warmupProgram(programId).then(response=>{
                if(response.data.code==200){
                    customAlert.alert("加热成功，合作信息将会被更多小伙伴看到！");
                }
                if(response.data.code!=200){
                    customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
                }
            }).catch(error=>{
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
            });
        },
        showJoinModalV(program){
            this.previewProgram=JSON.parse(JSON.stringify(program));
            this.applicationReqObj.message="";
            $("#programInfoModal").modal("show");
        },
        closeJoinModalV(){
            $("#programInfoModal").modal("hide");
        },
        filterByWorkModeV(workMode){
          this.programgrid_pagination.current=1;
          this.currentWorkModeFilter=workMode;
          this.programgrid_pagination.param.workMode=workMode;
          this.reloadPage(this.programgrid_pagination);
        },
        sortProgramV(sort){
          this.programgrid_pagination.current=1;
          this.programgrid_pagination.param.sort=sort;
          this.reloadPage(this.programgrid_pagination);

        },
        retrieveProgramGridV(){
          this.programgrid_pagination.current=1;
          this.programgrid_pagination.param.workMode="";
          this.programgrid_pagination.param.sort="1";
          this.reloadPage(this.programgrid_pagination);
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
        
    },
    updated(){
        $(function() {
            // Enable popovers 
            $('[data-bs-toggle="popover"]').popover();
        });
    }
}

let app =  createApp(RootComponent);
app.mixin(ImageAdaptiveComponent);
app.mixin(Pagination);
app.mixin(new Auth({need_permission : true}));
app.mixin(CodeExplainComponent);
app.mixin(DirectiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('col-') || tag.startsWith('top-search') 
}
const disProgram = app.mount('#app');

window.disProgramPage = disProgram;

// init
disProgram.pageInit(disProgram.programgrid_pagination);


async function doWarmupProgram(programId){
  const url="/api/v1/web_pod/cooperation/program/{id}/warm_up".replace("{id}",programId);
  return await axios.put(url);
}
async function doApplyProgram(dto){
  const url="/api/v1/web_pod/cooperation/program/apply_for";
  return await axios.post(url,dto);
}
async function warmupProgram(programId){
  return await doWarmupProgram(programId);
}

async function applyProgram(dto){
  return await doApplyProgram(dto);
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

