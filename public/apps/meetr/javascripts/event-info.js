import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import Auth from "/estudio/javascripts/auth.js"

import axios from "axios";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 
import {goErrorByReplace,goHome} from "/common/javascripts/pagenav.js";
import { CodeExplainComponent } from "/common/javascripts/compoent/code-explain-compoent.js";


import { renderDateInChina } from "/common/javascripts/util.js";

import { copyValueToClipboard } from "/common/javascripts/share-util.js";

import {EnvWebsite} from "/common/javascripts/tm-constant.js";

import Pagination  from "/common/javascripts/pagination-vue.js";


import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';
let customAlert = new CustomAlertModal();

const eventId = window.location.pathname.split('/').pop();


const currentDomain = window.location.hostname === 'localhost' ? EnvWebsite.LOCAL : EnvWebsite.PROD;

const RootComponent = {
    data() {
      return {
        init_finish: false,
        eventInfo: {
            topics: []
        },
        registrantList_pagination: {
            url: "/api/v1/app/meetr/event/attendees",
            size: 50,
            current: 1,
            total: 0,
            pages: 0,
            records: [],
            isLoading: false,
            param: {
              q: '',
              eventId: ''
            },
            responesHandler: (response)=>{
                if(response.code == 200){
                    this.registrantList_pagination.size = response.attendee.size;
                    this.registrantList_pagination.current = response.attendee.current;
                    this.registrantList_pagination.total = response.attendee.total;
                    this.registrantList_pagination.pages = response.attendee.pages;
                    this.registrantList_pagination.records = response.attendee.records;
                    this.registrantList_pagination.isLoading = false;
                }
            }
        },
      }
    },
    methods: {
        eventExpiredV(activityInfo) {
            if (!activityInfo || !activityInfo.activityStartAt) return true; // 安全检查

            const now = new Date();
            const activityTime = new Date(activityInfo.activityStartAt.replace(/-/g, '/'));
            
            const isExpired = now > activityTime; 
            
            return isExpired;
        },
        deleteOneEventV(eventId){
            deleteOneEvent(eventId).then(response=>{
              if(response.data.code == 200){
                goHome();
              }
              if(response.data.code!=200){
                  const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                  customAlert.alert(error); 
              }
      
            });
        },
        registerNowV(){
            registerEvent(this.eventInfo.id).then(response=>{
                if(response.data.code == 200){
                     
                    this.eventInfo.reserved='1';
                    this.eventInfo.attendees++;
                    customAlert.alert("预约成功，可通过【个人中心】-【预约信息】查看已预约的活动"); 
                }
           
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error); 
                }
        
            });
        },
        isEventInfoAuthorV(activityInfo){
            return this.getIdentity().brandId==activityInfo.hostedBrandId;
        },
        calcRawPercentV(current, max) {
            const currentNum = Number(current) || 0;
            const maxNum = Number(max) || 0;
            
            if (maxNum <= 0) return '0%';
            
            const percent = Math.min(100, Math.max(0, (currentNum / maxNum) * 100));
            return `${percent}%`; 
        },
        copyTextV(text){
            copyValueToClipboard(text);
        },
        searchRegistrantsV(){
            this.reloadPage(this.registrantList_pagination);
        },
        copyMeetrEventLinkV(activityInfo){
            const eventUrl=  currentDomain+"/apps/meetr/event/"+activityInfo.id;
  
  
            const title = activityInfo.title;
            const time = `\n⏰ 时间：${renderDateInChina(activityInfo.activityStartAt)}`;
            const location = `\n📍 地点：${activityInfo.location}` ;
  
            const copyContent = `📢 诚邀您参加活动：【${title}】${time}${location}\n🔗 点击链接查看活动信息：${eventUrl}`;
  
  
            copyValueToClipboard(copyContent);
        },
        renderDateInChinaV(dateStr){
            return renderDateInChina(dateStr);
        },
        showRegistrantsModalV(eventId){
            this.registrantList_pagination.records=[];
            this.registrantList_pagination.param.q="";
            $("#registrantsModal").modal("show");
            this.registrantList_pagination.param.eventId=eventId;
            this.pageInit(this.registrantList_pagination);
        },
        loadEventInfoInfoV(){
            loadEventInfoInfo(eventId).then(response => {
                if (response.data.code == 200 && !response.data.info) {
                    goErrorByReplace();
                    return
                }
                if (response.data.code == 200) {
                    this.eventInfo = response.data.info;

                    var title = !response.data.info?.title ? "活动详情" : response.data.info?.title ;
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
    }
}
let app =  createApp(RootComponent);
app.mixin(new Auth({need_permission : true,need_init: true}));
app.mixin(DirectiveComponent);
app.mixin(ImageAdaptiveComponent);
app.mixin(CodeExplainComponent);
app.mixin(Pagination);

const meetrAppEventInfo = app.mount('#app');

window.meetrAppEventInfoPage = meetrAppEventInfo;


meetrAppEventInfo.loadEventInfoInfoV();



async function fetchEventInfoInfo(eventId){
    const url="/api/v1/app/meetr/event/{id}/info".replace("{id}",eventId);
    return await axios.get(url);
}

async function doRegisterEvent(eventId){
    const url="/api/v1/app/meetr/event/{id}/reserve".replace("{id}",eventId);
    return await axios.post(url,{})
}

async function doDeleteEvnet(eventId){
    const url="/api/v1/app/meetr/event/{id}/del".replace("{id}",eventId);
    return await axios.delete(url);
}

async function deleteOneEvent(eventId){
    return await doDeleteEvnet(eventId);
}

async function registerEvent(eventId){
    return await doRegisterEvent(eventId);
}

async function loadEventInfoInfo(eventId){
   return  await fetchEventInfoInfo(eventId);
}


