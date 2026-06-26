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
      attendanceList_pagination: {
        url: "/api/v1/app/meetr/member/attendances",
        size: 10,
        current: 1,
        total: 0,
        pages: 0,
        records: [],
        paging: {},
        param: {
          q: '',
          eventStatus: ""
        },
        responesHandler: (response)=>{
            if(response.code == 200){
                this.attendanceList_pagination.size = response.attendance.size;
                this.attendanceList_pagination.current = response.attendance.current;
                this.attendanceList_pagination.total = response.attendance.total;
                this.attendanceList_pagination.pages = response.attendance.pages;
                this.attendanceList_pagination.records = response.attendance.records;
                this.attendanceList_pagination.paging = this.doPaging({current: response.attendance.current, pages: response.attendance.pages, size: 5});

            }
        }
    },
    }},
    methods: {
      eventExpiredV(activityInfo) {
        if (!activityInfo || !activityInfo.activityStartAt) return true; // 安全检查

        const now = new Date();
        const activityTime = new Date(activityInfo.activityStartAt.replace(/-/g, '/'));
        
        const isExpired = now > activityTime; 
        
        return isExpired;
      },
      eventStatusDisplayV(activityInfo){

        if(this.eventExpiredV(activityInfo)) return "已结束";

        return this.explainAppMeetrEventStatusEnumV(activityInfo.eventStatus); // code explain component.js

      },
      retrieveAttendanceDataV(){
        retrieveAttendanceData();
      },
      retrieveByStatusV(){
        this.attendanceList_pagination.current = 1;
        this.attendanceList_pagination.size = 10;
        this.reloadPage(this.attendanceList_pagination);
      },
      removeAttendanceV(attendanceRecordId){
        removeAttendance(attendanceRecordId).then(response=>{
            if(response.data.code==200){
                this.reloadPage(this.attendanceList_pagination);
            }
            if(response.data.code!=200){
                customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message);
            }
        }).catch(error=>{
            customAlert.alert("操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+error);
        });
      },
      formatDateV(dateOrString) {
        const date = new Date(dateOrString);
        
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${month}月${day}日 · ${hours}:${minutes}`;
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
                attendancePage.onMessageHandler(e); //  source: FriendListCompoent
            }
        }
    })
);
const attendancePage = app.mount('#app');
window.cAttendancePage = attendancePage;

attendancePage.pageInit(attendancePage.attendanceList_pagination);


function retrieveAttendanceData(){
  const tmp = attendancePage.attendanceList_pagination.param.q;
  initQueryParam();
  attendancePage.attendanceList_pagination.param.q = tmp;

  attendancePage.reloadPage(attendancePage.attendanceList_pagination);

}


function initQueryParam(){
  attendancePage.attendanceList_pagination.param = {
    q: '',
    eventStatus: ""
  }
  attendancePage.attendanceList_pagination.current = 1;
  attendancePage.attendanceList_pagination.size = 10;
}

async function doDelOneAttendance(attendanceRecordId){
  const url ="/api/v1/app/meetr/attendance/{id}/cancel".replace("{id}",attendanceRecordId);
  return await axios.delete(url);
}
async function removeAttendance(attendanceRecordId){
  return  await doDelOneAttendance(attendanceRecordId);
}

$(function(){
	$(".tooltip-nav").tooltip();
});