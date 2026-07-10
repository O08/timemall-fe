import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import Pagination  from "/common/javascripts/pagination-vue.js";
import Auth from "/estudio/javascripts/auth.js"
import {EventFeedScene} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js";
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

            application_pagination:{
                url: "/api/v1/web_pod/cooperation/brand/applications",
                size: 10,
                current: 1,
                total: 0,
                pages: 0,
                records: [],
                param: {
                    q: ""
                },
                paging: {},
                responesHandler: (response)=>{
                    if(response.code == 200){
                        this.application_pagination.size = response.application.size;
                        this.application_pagination.current = response.application.current;
                        this.application_pagination.total = response.application.total;
                        this.application_pagination.pages = response.application.pages;
                        this.application_pagination.records = response.application.records;
                        this.application_pagination.paging = this.doPaging({current: response.application.current, pages: response.application.pages, size: 5});

                    }
                }
            }
        }
    },
    methods: {
        retrieveApplicationV(){
          this.application_pagination.current = 1;
          this.application_pagination.size = 10;
          this.reloadPage(this.application_pagination);
        },
        deleteOneProgramApplicationV(applicationId){
            deleteOneProgramApplication(applicationId).then(response=>{
              if(response.data.code == 200){
                   this.reloadPage(this.application_pagination);
              }
              if(response.data.code!=200){
                  const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                  customAlert.alert(error); 
              }
      
            });
        }
    },
    created() {
        this.pageInit(this.application_pagination);
    },
    updated(){
        $(function() {
            // Remove already delete element popover ,maybe is bug
            $('[data-popper-reference-hidden]').remove();
            $('.popover.custom-popover.bs-popover-auto.fade.show').remove();
            // Enable popovers 
            $('[data-bs-toggle="popover"]').popover();
        });
    }
}
const app = createApp(RootComponent);
app.mixin(Pagination);
app.mixin(DirectiveComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(new EventFeed({need_fetch_event_feed_signal : true,
    need_fetch_mutiple_event_feed : false,
    scene: EventFeedScene.POD}));
app.mixin(ImageAdaptiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('content')
}
app.mixin(new FriendListCompoent({need_init: true}));
app.mixin(CodeExplainComponent);

app.mixin(
    new Ssecompoent({
        sslSetting:{
            need_init: true,
            onMessage: (e)=>{
                appliedProgram.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);
const appliedProgram = app.mount('#app');
window.appliedProgramPage= appliedProgram;

async function doDeleteOneProgramApplication(applicationId){
  const url="/api/v1/web_pod/cooperation/application/{id}/del".replace("{id}",applicationId);
  return await axios.delete(url);
}

async function deleteOneProgramApplication(applicationId){
  return await doDeleteOneProgramApplication(applicationId);
}

  // Enable popovers 
  $('[data-bs-toggle="popover"]').popover();

  $(function(){
	$(".tooltip-nav").tooltip();
});