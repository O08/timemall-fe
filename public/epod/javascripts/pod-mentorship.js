import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js";
import axios from 'axios';

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
      mentorList_pagination: {
        url: "/api/v1/web_epod/brand/mentor/query",
        size: 10,
        current: 1,
        total: 0,
        pages: 0,
        records: [],
        paging: {},
        param: {
          q: '',
          status: ""
        },
        responesHandler: (response)=>{
            if(response.code == 200){
                this.mentorList_pagination.size = response.mentor.size;
                this.mentorList_pagination.current = response.mentor.current;
                this.mentorList_pagination.total = response.mentor.total;
                this.mentorList_pagination.pages = response.mentor.pages;
                this.mentorList_pagination.records = response.mentor.records;
                this.mentorList_pagination.paging = this.doPaging({current: response.mentor.current, pages: response.mentor.pages, size: 5});

            }
        }
    },
    }},
    methods: {
      retrieveMentorDataV(){
        retrieveMentorData();
      },
      retrieveByStatusV(){
        this.mentorList_pagination.current = 1;
        this.mentorList_pagination.size = 10;
        this.reloadPage(this.mentorList_pagination);
      },
      removeMentorV(mentorRecordId){
        removeMentor(mentorRecordId).then(response=>{
            if(response.data.code==200){
                this.reloadPage(this.mentorList_pagination);
            }
            if(response.data.code!=200){
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
            }
        }).catch(error=>{
            customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
        });
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
                mentorPage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);
const mentorPage = app.mount('#app');
window.cMentorPage = mentorPage;

mentorPage.pageInit(mentorPage.mentorList_pagination);


function retrieveMentorData(){
  const tmp = mentorPage.mentorList_pagination.param.q;
  initQueryParam();
  mentorPage.mentorList_pagination.param.q = tmp;

  mentorPage.reloadPage(mentorPage.mentorList_pagination);

}


function initQueryParam(){
  mentorPage.mentorList_pagination.param = {
    q: '',
    status: ""
  }
  mentorPage.mentorList_pagination.current = 1;
  mentorPage.mentorList_pagination.size = 10;
}

async function doDelOneMentor(mentorRecordId){
  const url ="/api/v1/web_epod/brand/mentor/{id}/del".replace("{id}",mentorRecordId);
  return await axios.delete(url);
}
async function removeMentor(mentorRecordId){
  return  await doDelOneMentor(mentorRecordId);
}

$(function(){
	$(".tooltip-nav").tooltip();
});