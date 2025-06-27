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

import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const RootComponent = {
  data() {
    return {
      materialList: [],
      caseList_pagination: {
        url: "/api/v1/team/dsp_case/list",
        size: 10,
        current: 1,
        total: 0,
        pages: 0,
        records: [],
        paging: {},
        param: {
          q: '',
          caseStatus: "",
          materialType: "informer"
        },
        responesHandler: (response)=>{
            if(response.code == 200){
                this.caseList_pagination.size = response.reportCase.size;
                this.caseList_pagination.current = response.reportCase.current;
                this.caseList_pagination.total = response.reportCase.total;
                this.caseList_pagination.pages = response.reportCase.pages;
                this.caseList_pagination.records = response.reportCase.records;
                this.caseList_pagination.paging = this.doPaging({current: response.reportCase.current, pages: response.reportCase.pages, size: 5});

            }
        }
    },
    }},
    methods: {
      retrieveCaseDataV(){
        retrieveCaseData();
      },
      retrieveByCaseStatusV(){
        this.caseList_pagination.current = 1;
        this.caseList_pagination.size = 10;
        this.reloadPage(this.caseList_pagination);
      },
      uploadCaseMaterialV(){
        if(!document.querySelector('#caseMaterialFile') || !document.querySelector('#caseMaterialFile').value ){
          return;
        }
        uploadCaseMaterialBO(this.addingCaseNo).then(response=>{
          if(response.data.code==200){
              document.querySelector('#caseMaterialFile').value = null;

              $("#caseMaterialModal").modal("hide"); // show modal
              customAlert.alert("上传成功");
          }
          if(response.data.code!=200){
              customAlert.alert(response.data.message);
          }
        });
      },
      showAddNewMaterialModalV(caseNO){
        this.addingCaseNo = caseNO;
        document.querySelector('#caseMaterialFile').value = null;
        $("#caseMaterialModal").modal("show"); // show modal
      },
      showViewMaterialModalV(caseNO){
        this.materialList = [];
        fetchMaterial(caseNO).then(response=>{
            if(response.data.code==200){

                this.materialList = response.data.material;
                $("#caseMaterialViewModal").modal("show"); // show modal

            }
        })
      }
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
                dspPage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);
const dspPage = app.mount('#app');
window.cDsp = dspPage;

dspPage.pageInit(dspPage.caseList_pagination);


async function doFetchMaterial(caseNO){

  const url ="/api/v1/team/dsp_case/{case_no}/material?materialType=informer".replace("{case_no}",caseNO);
  return await axios.get(url);

}

async function uploadCaseMaterial(caseNO,materialFile){
var form = new FormData();
form.append("material",materialFile);
form.append("materialType","informer");
form.append("caseNO",caseNO);
const url ="/api/v1/team/dsp_case/add_material";
return await axios.post(url,form);
}
async function uploadCaseMaterialBO(caseNO){

  if($('#caseMaterialFile')[0].files.length === 0){

      customAlert.alert("未选择文件");

      return;
  }

 const materialFile = $('#caseMaterialFile')[0].files[0];

 return await uploadCaseMaterial(caseNO,materialFile);

}

async function fetchMaterial(caseNO){

 return await doFetchMaterial(caseNO);

}



function retrieveCaseData(){
  const tmp = dspPage.caseList_pagination.param.q;
  initQueryParam();
  dspPage.caseList_pagination.param.q = tmp;

  dspPage.reloadPage(dspPage.caseList_pagination);

}


function initQueryParam(){
  dspPage.caseList_pagination.param = {
    q: '',
    caseStatus: "",
    materialType: "informer"
  }
  dspPage.caseList_pagination.current = 1;
  dspPage.caseList_pagination.size = 10;
}

$(function(){
	$(".tooltip-nav").tooltip();
});