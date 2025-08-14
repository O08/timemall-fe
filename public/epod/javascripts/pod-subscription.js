import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js"
import {EventFeedScene} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import FriendListCompoent from "/common/javascripts/compoent/private-friend-list-compoent.js"
import Ssecompoent from "/common/javascripts/compoent/sse-compoent.js";
import Pagination  from "/common/javascripts/pagination-vue.js";
import {CodeExplainComponent} from "/common/javascripts/compoent/code-explain-compoent.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import {CodeMappingTypeEnum,EnvWebsite} from "/common/javascripts/tm-constant.js";
import {DspReportApi} from "/common/javascripts/dsp-report-api.js";

import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();


const currentDomain = window.location.hostname === 'localhost' ? EnvWebsite.LOCAL : EnvWebsite.PROD;



const RootComponent = {
  data() {
    return {
      viewPlanObj: {},
      reportOptions: [],
      reportForm: this.initReportForm(),
      focusModal:{
          message: "",
          confirmHandler:()=>{

          }
      },
      subscription_pagination: {
        url: "/api/v1/web_epod/subscription/query",
        size: 10,
        current: 1,
        total: 0,
        pages: 0,
        records: [],
        paging: {},
        param: {
          q: '',
          tag: ""
        },
        responesHandler: (response)=>{
            if(response.code == 200){
                this.subscription_pagination.size = response.subscription.size;
                this.subscription_pagination.current = response.subscription.current;
                this.subscription_pagination.total = response.subscription.total;
                this.subscription_pagination.pages = response.subscription.pages;
                this.subscription_pagination.records = response.subscription.records;
                this.subscription_pagination.paging = this.doPaging({current: response.subscription.current, pages: response.subscription.pages, size: 5});

            }
        }
    },
    }},
    methods: {

      searchV(){
        this.subscription_pagination.param.tag = "";
        this.subscription_pagination.current = 1;
        this.subscription_pagination.size = 10;
        this.reloadPage(this.subscription_pagination);
      },
      filterByStatusV(){
        this.subscription_pagination.current = 1;
        this.subscription_pagination.size = 10;
        this.reloadPage(this.subscription_pagination);
      },
      showPlanViewModalV(id){
        fetchPlanInfo(id).then(response=>{

          if(response.data.code==200){
              this.viewPlanObj=response.data.plan;
              $("#planViewModal").modal("show"); // show modal
          }
          if(response.data.code!=200){
              const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
              customAlert.alert(error);
          }

        }).catch(error=>{
              customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
        });


      },
      closFocusModalV(){
        $("#focusModal").modal("hide"); 
      },
      showCancelFocusModalV(subscription){
        this.focusModal.message="即将为您取消套餐："+subscription.planName;
        this.focusModal.confirmHandler=()=>{
          cancelSubscription(subscription.subscriptionId)
         }
        $("#focusModal").modal("show"); // show modal
      },

    
      newReportCaseV(){
        newReportCase(this.reportForm).then(response=>{
            if(response.data.code==200){

            document.querySelector('#caseMaterialFile').value = null;

            $("#reportOasisModal").modal("hide"); // show success modal

            }
            if(response.data.code!=200){
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
            }
        })
      },
      showOasisReportModalV(orderId){

          this.reportForm=this.initReportForm();
          this.reportForm.sceneUrl = this.reportForm.sceneUrl+orderId;

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
            scene: "付费订阅",
            sceneUrl: currentDomain+"/mall/dsp-report-scene?scene=subscription&subscription_id=",
            caseDesc: "",
            material: ""
        }
      },
    },
    updated(){
        
        $(function() {
            $('[data-popper-reference-hidden]').remove();
            $('.popover.custom-popover.bs-popover-auto.fade.show').remove();
            // Enable popovers 
            $('[data-bs-toggle="popover"]').popover();
        });
    }
}

const app = createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : false,
    scene: EventFeedScene.POD}));
app.mixin(ImageAdaptiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('content')
}
app.mixin(new FriendListCompoent({need_init: true}));
app.mixin(Pagination);
app.mixin(CodeExplainComponent);
app.mixin(DirectiveComponent);

app.mixin(
    new Ssecompoent({
        sslSetting:{
            need_init: true,
            onMessage: (e)=>{
                subscribePage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);
const subscribePage = app.mount('#app');
window.cSubscribePage = subscribePage;

subscribePage.pageInit(subscribePage.subscription_pagination);


async function doFetchOnePlanInfo(id){
  const url = "/api/v1/web_estudio/brand/subscription/plan/{id}/query".replace("{id}",id);
  return await axios.get(url);
}
async function doCancelSubscription(id){
  const url="/api/v1/web_epod/subscription/{id}/cancel".replace("{id}",id);
  return await axios.put(url,{});
}
async function fetchPlanInfo(id){
  return doFetchOnePlanInfo(id)
}

async function cancelSubscription(id){
   doCancelSubscription(id).then(response=>{
    if(response.data.code==200){
      subscribePage.reloadPage(subscribePage.subscription_pagination);
      $("#focusModal").modal("hide"); // hide modal
    }
    if(response.data.code!=200){
      const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
      customAlert.alert(error); 
    }
  })
}
 // report feature


async function newReportCase(reportForm){
  
  const materialFile =  $('#caseMaterialFile')[0].files[0];

  var form = new FormData();
  if(!!materialFile){
    form.append("material",materialFile);
  }
  form.append("fraudType",reportForm.fraudType);
  form.append("scene",reportForm.scene);
  form.append("sceneUrl",reportForm.sceneUrl);
  form.append("caseDesc",reportForm.caseDesc);
  return await DspReportApi.addNewReportCase(form);

}
async function loadReportIssueList(appObj){
  const response = await DspReportApi.fetchCodeList(CodeMappingTypeEnum.REPORTISSUE,"");
  var data = await response.json();
  if(data.code==200){
     
     appObj.reportOptions=data.codes.records;

  }
}

async function showOasisReportModal(loadReportIssueListV){
    await loadReportIssueListV();
    $("#reportOasisModal").modal("show");
}


$(function(){
	$(".tooltip-nav").tooltip();
});