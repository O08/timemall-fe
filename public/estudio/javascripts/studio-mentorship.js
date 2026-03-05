import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"
import axios from 'axios';
import {EventFeedScene,MentorshipStatusEnum} from "/common/javascripts/tm-constant.js";
import EventFeed from "/common/javascripts/compoent/event-feed-compoent.js"
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
          menteeList_pagination: {
            url: "/api/v1/web_estudio/brand/mentee/query",
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
                    this.menteeList_pagination.size = response.mentee.size;
                    this.menteeList_pagination.current = response.mentee.current;
                    this.menteeList_pagination.total = response.mentee.total;
                    this.menteeList_pagination.pages = response.mentee.pages;
                    this.menteeList_pagination.records = response.mentee.records;
                    this.menteeList_pagination.paging = this.doPaging({current: response.mentee.current, pages: response.mentee.pages, size: 5});
    
                }
            }
        },
    }},
    methods: {
        enrollMenteeV(menteeRecordId){
            modifyMenteeStatus(menteeRecordId,MentorshipStatusEnum.TRAINING).then(response=>{
                if(response.data.code==200){
                    this.reloadPage(this.menteeList_pagination);
                }
                if(response.data.code!=200){
                    customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
                }
            }).catch(error=>{
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
            });
        },
        graduationGrantedV(menteeRecordId){
            modifyMenteeStatus(menteeRecordId,MentorshipStatusEnum.GRADUATED).then(response=>{
                if(response.data.code==200){
                    this.reloadPage(this.menteeList_pagination);
                }
                if(response.data.code!=200){
                    customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
                }
            }).catch(error=>{
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
            });
        },
        removeMenteeV(menteeRecordId){
            removeMentee(menteeRecordId).then(response=>{
                if(response.data.code==200){
                    this.reloadPage(this.menteeList_pagination);
                }
                if(response.data.code!=200){
                    customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
                }
            }).catch(error=>{
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
            });
        },
        retrieveMenteeDataV(){
            retrieveMenteeData();
        },
        retrieveByStatusV(){
            this.menteeList_pagination.current = 1;
            this.menteeList_pagination.size = 10;
            this.reloadPage(this.menteeList_pagination);
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
    scene: EventFeedScene.STUDIO}));
app.mixin(ImageAdaptiveComponent);
app.config.compilerOptions.isCustomElement = (tag) => {
    return tag.startsWith('content') || tag.startsWith('top-search')
}
app.mixin(new FriendListCompoent({need_init: true}));

app.mixin(
    new Ssecompoent({
        sslSetting:{
            need_init: true,
            onMessage: (e)=>{
                mentorshipPage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);
app.mixin(Pagination);
app.mixin(CodeExplainComponent);
app.mixin(DirectiveComponent);

const mentorshipPage = app.mount('#app');
window.cMentorshipPage = mentorshipPage;
mentorshipPage.pageInit(mentorshipPage.menteeList_pagination);


function retrieveMenteeData(){
  const tmp = mentorshipPage.menteeList_pagination.param.q;
  initQueryParam();
  mentorshipPage.menteeList_pagination.param.q = tmp;

  mentorshipPage.reloadPage(mentorshipPage.menteeList_pagination);

}


function initQueryParam(){
  mentorshipPage.menteeList_pagination.param = {
    q: '',
    status: "",
  }
  mentorshipPage.menteeList_pagination.current = 1;
  mentorshipPage.menteeList_pagination.size = 10;
}


async function doChangeMenteeStatus(dto){
    const url="/api/v1/web_estudio/brand/mentee/change_status";
    return await axios.put(url,dto);
}
async function doDelOneMentee(menteeRecordId){
    const url ="/api/v1/web_estudio/brand/mentee/{id}/del".replace("{id}",menteeRecordId);
    return await axios.delete(url);
}
async function removeMentee(menteeRecordId){
    return  await doDelOneMentee(menteeRecordId);
}
async function modifyMenteeStatus(menteeRecordId,status){
    const dto={
        id: menteeRecordId,
        status: status
    }
    return await doChangeMenteeStatus(dto);
}

$(function(){
	$(".tooltip-nav").tooltip();
});