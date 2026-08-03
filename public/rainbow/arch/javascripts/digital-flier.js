import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"
import Pagination  from "/common/javascripts/pagination-vue.js";


import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import  PrivateApi from "/rainbow/arch/javascripts/PrivateApi.js";
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";
import {SseEventBusScene} from "/common/javascripts/tm-constant.js";
import {DspReportApi} from "/common/javascripts/dsp-report-api.js";



import { copyValueToClipboard } from "/common/javascripts/share-util.js";
import {EnvWebsite,CodeMappingTypeEnum} from "/common/javascripts/tm-constant.js";

import { formatCmpctNumber } from "/common/javascripts/util.js";




import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
import axios from "axios";
let customAlert = new CustomAlertModal();

const currentDomain = window.location.hostname === 'localhost' ? EnvWebsite.LOCAL : EnvWebsite.PROD;

const FlierInteractEventEnum=Object.freeze({
  "RECEIVER_LIKE": "receiver_like",  // cell plan order 
  "RECEIVER_CTA_CLICK": "receiver_cta_click",
  "VISITOR_LIKE": "visitor_like",
  "VISITOR_CTA_CLICK": "visitor_cta_click"
}); 


const RootComponent = {
    data() {
      return {

        reportOptions: [],
        reportForm: this.initReportForm(),

        feedArr: [],

        friends:{records: []},
        friedListQueryParam:{
          q: ""
        },
        flierList_pagination: {
          url: "/api/v1/web_estudio/receiver/flier/query",
          size: 10,
          current: 1,
          total: 0,
          pages: 0,
          records: [],
          paging: {},
          isLoading: false,
          param: {
            q: ''
          },
          responesHandler: (response)=>{
              if(response.code == 200){
                  this.flierList_pagination.size = response.flier.size;
                  this.flierList_pagination.current = response.flier.current;
                  this.flierList_pagination.total = response.flier.total;
                  this.flierList_pagination.pages = response.flier.pages;
                  this.flierList_pagination.records = response.flier.records;
                  this.flierList_pagination.paging = this.doPaging({current: response.flier.current, pages: response.flier.pages, size: 5});
                  this.feedArr.push(...response.flier.records);
                  this.flierList_pagination.isLoading = false;
              }
          }
        },
      }
    },
    methods: {
      copyValueToClipboardV(flierId){
        const copyContent=currentDomain+"/flier/"+flierId;
        copyValueToClipboard(copyContent);
      },
      openCtaLinkV(flier){
        if(!flier.ctaLink) return ;
        if(flier.hasClickCta != '1') {
          receiverFlierInteract(flier.flierId,FlierInteractEventEnum.RECEIVER_CTA_CLICK).then(response => {
       
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

          return;
        }
        if(flier.hasClickCta == '1')  this.openLinkV(flier.ctaLink);

      },
      receiverFlierLikeInteractV(flier){
        if(flier.hasLike=='1') return;
        receiverFlierInteract(flier.flierId,FlierInteractEventEnum.RECEIVER_LIKE).then(response => {
       
          if (response.data.code == 200) {
            flier.likes=Number(flier.likes)+1;
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

      deleteOneFlierCopyV(flierCopyId){
        deleteOneFlierCopy(flierCopyId).then(response => {
       
          if (response.data.code == 200) {
            this.feedArr = this.feedArr.filter(item => item.flierCopyId !== flierCopyId);
          }

          if (response.data.code != 200) {
              const error = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message;
              customAlert.alert(error);
          }
       }).catch(error => {
           customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + error);
       });
      },


      fetchPrivateFriendV(){

            PrivateApi.fetchPrivateFriend(this.friedListQueryParam).then(response=>{
               if(response.data.code==200){
                  this.friends=response.data.friend;
               }
            });

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


      // 滚动事件处理函数
      handleFeedScroll(event) {
        const { scrollTop, clientHeight, scrollHeight } = event.target;

        const triggerThreshold = 400; 

        if (scrollHeight - scrollTop - clientHeight < triggerThreshold) {
          this.loadNextFlierPageV();
        }
      },

      loadNextFlierPageV() {
        // 检查节流阀，或者是否已经没有更多页了
        if(this.flierList_pagination.isLoading){
          return;
        }
        if(this.flierList_pagination.current>=this.flierList_pagination.pages){
          return;
        }
        this.flierList_pagination.current = this.flierList_pagination.current +  1;
        this.flierList_pagination.isLoading = true;
  
        this.reloadPage(this.flierList_pagination);

      }
         
    },
    mounted() {
      // 查找滚动容器
      const container = document.querySelector('.content-wrapper');
      if (container) {
        container.addEventListener('scroll', this.handleFeedScroll);
      }
    },
    beforeDestroy() {
      // 组件销毁前解绑事件，避免内存泄漏
      const container = document.querySelector('.content-wrapper');
      if (container) {
        container.removeEventListener('scroll', this.handleFeedScroll);
      }
    },
    updated(){
        
        $(function() {
            // Enable popovers 
            $('[data-bs-toggle="popover"]').popover();
        });

        
    }
}


let app =  createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);
app.mixin(Pagination);
app.mixin(
    new Ssecompoent({
        sslSetting:{
            need_init: true,
            onMessage: (e)=>{
               console.log("msg is :" + e.data);
               var data= JSON.parse(e.data);
               if(data.scene===SseEventBusScene.PRIVATE){
                 sseEventBusPrivateSeceneHandler(data);
               }
            }
        }
    })
);
app.config.compilerOptions.isCustomElement = (tag) => {
  return tag.startsWith('col-')
}

const digitalFlierApp = app.mount('#app');



window.digitalFlierAppPage = digitalFlierApp;

digitalFlierApp.fetchPrivateFriendV();
digitalFlierApp.pageInit(digitalFlierApp.flierList_pagination);



async function flierInteract(dto){
  const url="/api/v1/web_estudio/flier/interact";
  return await axios.post(url,dto);
}

async function doDeleteFlierCopy(flierCopyId){
  const url="/api/v1/web_estudio/flier/copy{id}/remove".replace("{id}",flierCopyId);
  return await axios.delete(url);
}

async function deleteOneFlierCopy(flierCopyId){
  return await doDeleteFlierCopy(flierCopyId);
}  

async function receiverFlierInteract(flierId,event){
  const dto={
    flierId: flierId,
    event: event
  }

  return await flierInteract(dto);
}

function sseEventBusPrivateSeceneHandler(data){
  digitalFlierApp.fetchPrivateFriendV();
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

