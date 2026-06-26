import "/common/javascripts/import-jquery.js";
import { createApp } from "vue";
import axios from 'axios';
import Auth from "/estudio/javascripts/auth.js";
import { copyValueToClipboard } from "/common/javascripts/share-util.js";

import {ImageAdaptiveComponent} from '/common/javascripts/compoent/image-adatpive-compoent.js'; 

import { getQueryVariable,renderDateInChina } from "/common/javascripts/util.js";
import { DirectiveComponent } from "/common/javascripts/custom-directives.js";
import Pagination  from "/common/javascripts/pagination-vue.js";
import  AppApi from "/apps/common/javascripts/AppApi.js";
import { CodeExplainComponent } from "/common/javascripts/compoent/code-explain-compoent.js";
import { renderDateToDayInChina,getDayName } from "/common/javascripts/util.js";
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'
import {EnvWebsite} from "/common/javascripts/tm-constant.js";
import { transformInputNumberAsPositiveDecimal,transformInputNumberAsPositive,formatCmpctNumber } from "/common/javascripts/util.js";
import { isValidHttpUrlNeedScheme } from "/common/javascripts/util.js";



import {CustomAlertModal} from '/common/javascripts/ui-compoent.js';

let customAlert = new CustomAlertModal();

const sandboxEnv= getQueryVariable("sandbox");
const currentOch = window.location.pathname.split('/').pop();

const currentDomain = window.location.hostname === 'localhost' ? EnvWebsite.LOCAL : EnvWebsite.PROD;

const RootComponent = {
    data() {
      return {
        sandbox: !sandboxEnv ? "0" : sandboxEnv,

        memberCanPost: false,
        newEventObj:{
          eventType: "Offline",
          thumbnail: "",
          thumbnailUrl: "",
          title: "",
          category: "2",
          channel: currentOch,
          description: "",
          location: "",
          activityStartDate: "",
          activityStartTime: "",
          topics: [],
          inputTopic: "",
          duration: "60",
          durationType: "Minutes",
          maxSeats: "",
          allowGuests: "1",
          budget: "",
          onlineLink: ""
        },
        editEventObj:{
          eventType: "Offline",
          thumbnail: "",
          thumbnailUrl: "",
          title: "",
          category: "2",
          channel: currentOch,
          description: "",
          location: "",
          activityStartDate: "",
          activityStartTime: "",
          topics: [],
          inputTopic: "",
          duration: "60",
          durationType: "Minutes",
          maxSeats: "",
          allowGuests: "1",
          budget: "",
          onlineLink: ""
        },
        editEventObjHistory:{
          topics: [],
        },

        general: {
          channelName: "",
          channelDesc: "",
          oasisAdminBrandId: "",
          guide: {
              postStrategy: ""
          }
        },
        genres:[
            {
            category: "1",
            genreName: "科技"
           },
           {
            category: "2",
            genreName: "社交聚会"
           },
           {
            category: "3",
            genreName: "兴趣爱好"
           },
           {
            category: "4",
            genreName: "运动健身"
           }, {
            category: "5",
            genreName: "旅游户外"
           },
           {
            category: "6",
            genreName: "商业"
           },
           {
            category: "7",
            genreName: "游戏"
           },
           {
            category: "8",
            genreName: "舞蹈"
           },
           {
            category: "9",
            genreName: "音乐"
           }, {
            category: "10",
            genreName: "健康养生"
           },
           {
            category: "11",
            genreName: "文化艺术"
           },
           {
            category: "12",
            genreName: "教育"
           },
           {
            category: "13",
            genreName: "萌宠"
           },
           {
            category: "14",
            genreName: "写作"
           }, {
            category: "15",
            genreName: "亲子家庭"
           }
        ],
        eventInfo: {
            topics: []
        },
        feedArr: [],
        feedList_pagination: {
            url: "/api/v1/app/meetr/events/find",
            size: 24,
            current: 1,
            total: 0,
            pages: 0,
            records: [],
            isLoading: false,
            param: {
              q: '',
              sort: "1",
              category: "",
              channelId: currentOch
            },
            responesHandler: (response)=>{
                if(response.code == 200){
                    this.feedList_pagination.size = response.event.size;
                    this.feedList_pagination.current = response.event.current;
                    this.feedList_pagination.total = response.event.total;
                    this.feedList_pagination.pages = response.event.pages;
                    this.feedList_pagination.records = response.event.records;
                    this.feedList_pagination.isLoading = false;
                    this.feedArr.push(...response.event.records);
                }
            }
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
          copyTextV(text){
            copyValueToClipboard(text);
          },
          transformInputNumberAsPositiveDecimalV(e){
              return transformInputNumberAsPositiveDecimal(e);
          },
          transformInputNumberAsPositiveV(e){
            return transformInputNumberAsPositive(e);
          },
          validateNewEventModalV() {
            const form = this.newEventObj;
        
            if (!form.title || !form.activityStartDate || !form.activityStartTime || 
              !form.thumbnail || !form.category || !form.description || 
              form.duration === '' || !form.durationType || 
              form.maxSeats === '' || form.budget === '' ||
              form.topics.length === 0 || 
              !form.location || 
              (form.eventType === 'Online' && !form.onlineLink)) {
              return false;
            }

            if(form.onlineLink &&  !isValidHttpUrlNeedScheme(form.onlineLink)){
              return false;
            }

            const nowTime = new Date().getTime();
            const inputDateTimeStr = `${form.activityStartDate} ${form.activityStartTime}`;

            const inputTime = new Date(inputDateTimeStr).getTime();
            
            if (inputTime <= nowTime) {
                return false; 
            }

            return true;
          },
          validateEditEventModalV() {
            const form = this.editEventObj;
            const historyForm=this.editEventObjHistory;
        
            if (!form.title || !form.activityStartDate || !form.activityStartTime || 
               !form.eventStatus  || !form.category || !form.description || 
              form.duration === '' || !form.durationType || 
              form.maxSeats === '' || form.budget === '' ||
              form.topics.length === 0 || 
              !form.location || 
              (form.eventType === 'Online' && !form.onlineLink)) {
              return false;
            }

            if(form.onlineLink &&  !isValidHttpUrlNeedScheme(form.onlineLink)){
              return false;
            }

            const nowTime = new Date().getTime();
            const inputDateTimeStr = `${form.activityStartDate} ${form.activityStartTime}`;

            const inputTime = new Date(inputDateTimeStr).getTime();
            
            if (inputTime <= nowTime) {
                return false; 
            }

            const dataChanged=(form.title!=historyForm.title || form.eventType!=historyForm.eventType 
               ||  form.activityStartDate!=historyForm.activityStartDate  || form.activityStartTime!=historyForm.activityStartTime
               ||  form.duration!=historyForm.duration  || form.durationType!=historyForm.durationType
               ||  form.category!=historyForm.category  || form.location!=historyForm.location
               || form.onlineLink!=historyForm.onlineLink || form.maxSeats!=historyForm.maxSeats || form.budget!=historyForm.budget
               || JSON.stringify(form.topics) !== JSON.stringify(historyForm.topics) || form.allowGuests!=historyForm.allowGuests
               || form.eventStatus!=historyForm.eventStatus || form.description!=historyForm.description
              );

            return dataChanged;
          },
    
        formatEventDateV(dateOrString) {
          const date = new Date(dateOrString);
          
          const year = date.getFullYear();
          const month = date.getMonth() + 1;
          const day = date.getDate();
          
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          
          return `${year}年${month}月${day}日 · ${hours}:${minutes}`;
        },
        calcRawPercentV(current, max) {
          const currentNum = Number(current) || 0;
          const maxNum = Number(max) || 0;
          
          if (maxNum <= 0) return '0%';
          
          const percent = Math.min(100, Math.max(0, (currentNum / maxNum) * 100));
          return `${percent}%`; 
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
        showNewEventModalV(){
           this.newEventObj = this.initNewEventModalDataObj();
           const coverInput = document.getElementById('coverInput');
            if (coverInput) {
              coverInput.value = '';
            }
            $("#publishModal").modal("show");
        },
        selectNewEventModalTypeV(eventType){
            this.newEventObj.eventType=eventType;
        },
        previewNewEventThumbnailV(e){
          previewNewEventThumbnail(e,this)
        },
        isEventInfoAuthorV(activityInfo){
          return this.getIdentity().brandId==activityInfo.hostedBrandId;
        },
        isChannelAdminV(){
          return this.getIdentity().brandId==this.general.oasisAdminBrandId;
        },
        showEditEventModalV(activityInfo){
            const editEventObjCopy=JSON.parse(JSON.stringify(activityInfo));

            const [datePart, timePart] = editEventObjCopy.activityStartAt.split(' ');

             this.editEventObj={
              id: editEventObjCopy.id,
              eventStatus: editEventObjCopy.eventStatus,
              eventType: editEventObjCopy.eventType,
              thumbnail: "",
              thumbnailUrl: editEventObjCopy.thumbnail,
              title: editEventObjCopy.title,
              category: editEventObjCopy.category,
              description: editEventObjCopy.description,
              location: editEventObjCopy.location,
              activityStartDate: datePart,
              activityStartTime: timePart.slice(0, 5),
              topics: editEventObjCopy.topics,
              inputTopic: "",
              duration: editEventObjCopy.duration,
              durationType: editEventObjCopy.durationType,
              maxSeats: editEventObjCopy.maxSeats,
              allowGuests: editEventObjCopy.allowGuests,
              budget: editEventObjCopy.budget,
              onlineLink: editEventObjCopy.onlineLink
             }

             const coverInput = document.getElementById('editCoverInput');
             if (coverInput) {
               coverInput.value = '';
             }

             this.editEventObjHistory=JSON.parse(JSON.stringify(this.editEventObj));
             
            $("#eventDetailModal").modal("hide");

            $("#editModal").modal("show");
        },
        closeEditEventModalWhenNoChangeNeedV(){

          $("#editModal").modal("hide");
          $("#eventDetailModal").modal("show");

        },
        previewEditEventThumbnailV(e){
          previewEditEventThumbnail(e,this);
        },
        selectEditEventModalTypeV(eventType){
          this.editEventObj.eventType=eventType;
        },
        deleteOneEventV(eventId){
          deleteOneEvent(eventId).then(response=>{
            if(response.data.code == 200){
                 // todo remove event from feedArr
                 this.feedArr = this.feedArr.filter(event => event.id !== eventId);
                 $("#editModal").modal("hide");
            }
            if(response.data.code!=200){
                const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                customAlert.alert(error); 
            }
    
          });
        },
        showEventDetailModalV(eventId){
            findEventProfile(eventId).then(response=>{
                if(response.data.code == 200){
                     this.eventInfo=response.data.info;
                     $("#eventDetailModal").modal("show");
                }
                if(response.data.code!=200){
                    const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
                    customAlert.alert(error); 
                }
        
            });
        },
        showRegistrantsModalV(eventId){
          this.registrantList_pagination.records=[];
          this.registrantList_pagination.param.q="";
          $("#eventDetailModal").modal("hide");
          $("#registrantsModal").modal("show");
          this.registrantList_pagination.param.eventId=eventId;
          this.pageInit(this.registrantList_pagination);
        },
        closeRegistrantsModalHandlerV(){
          $("#eventDetailModal").modal("show");
          $("#registrantsModal").modal("hide");
        },
        searchRegistrantsV(){
          this.reloadPage(this.registrantList_pagination);
        },
        addNewEventTopicV(){
 
          const tagValue = this.newEventObj.inputTopic;
          const topics =  this.newEventObj.topics;
          this.newEventObj.inputTopic = ''; 

          if (!tagValue || topics.includes(tagValue) || topics.length >= 5) {
            return;
          }

          this.newEventObj.topics = [...topics, tagValue];
        },
        addEditEventTopicV(){
          const tagValue = this.editEventObj.inputTopic;
          this.editEventObj.inputTopic = ''; 

          if (!tagValue) return;
          if ( this.editEventObj.topics.includes(tagValue)) return;
          if ( this.editEventObj.topics.length >= 5) return;

          this.editEventObj.topics.push(tagValue);
        },
        removeNewEventTopicV(index){
          this.newEventObj.topics.splice(index, 1);
        },
        removeEditEventTopicV(index){
          this.editEventObj.topics.splice(index, 1);
        },
        publishEventV() {
          publishEvent(this.newEventObj).then(response => {
            if (response.data.code == 200) {
              this.initEventFeedListV();
              $("#publishModal").modal("hide");
            }

            if (response.data.code != 200) {
              const error = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message;
              customAlert.alert(error);
            }

          });
        },
        editEventV(){
          editEvent(this.editEventObj).then(response => {
            if (response.data.code == 200) {
              $("#editModal").modal("hide");
              this.showEventDetailModalV(this.editEventObj.id);
            }

            if (response.data.code != 200) {
              const error = "操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息：" + response.data.message;
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
        retrieveFeedListV(){
            this.feedArr=[]; // reset feed 
            this.feedList_pagination.current = 1;
            this.feedList_pagination.param.sort="1";
            this.feedList_pagination.param.category="";
            this.reloadPage(this.feedList_pagination);
        },
        initEventFeedListV(){
          this.feedArr=[]; // reset feed 
          this.feedList_pagination.current = 1;
          this.feedList_pagination.param.sort="1";
          this.feedList_pagination.param.category="";
          this.feedList_pagination.param.q="";
          this.reloadPage(this.feedList_pagination);
        },
        sortFeedListV(){
            this.feedArr=[]; // reset feed 
            this.feedList_pagination.current = 1;
            this.reloadPage(this.feedList_pagination);
        },
        filterFeedListV(category){
            this.feedArr=[]; // reset feed 
            this.feedList_pagination.current = 1;
            this.feedList_pagination.param.category=category;
            this.reloadPage(this.feedList_pagination);
        },
        formatCmpctNumberV(number){
            return formatCmpctNumber(number);
        },
        fetchChannelGeneralInfoV(){
       
            AppApi.fetchChannelGeneralInfo(currentOch).then(response=>{
                   if(response.data.code == 200){
                    const result=response.data.channel;
                    var guide= {postStrategy: "0"}
                    if(result && result.guide) {
                        guide = JSON.parse(result.guide);
                    } 
                   this.general = !result ? {guide} : { oasisAdminBrandId: result.oasisAdminBrandId, channelName: result.channelName, channelDesc: result.channelDesc,guide: guide};
                   
                   this.memberCanPost=guide.postStrategy=='1';

                    var title = !response.data.channel ? "活动咖" : response.data.channel.channelName;
                    document.title = title + " | bluvarri.com";
                }
            });
        },
        renderDateToDayInChinaV(dateStr){
            return renderDateToDayInChina(dateStr);
        },
        getDayNameV(dateStr){
            return getDayName(dateStr);
        },
        showMoreV(){
            showMore();
        },
        initNewEventModalDataObj(){

            return {
                eventType: "Offline",
                thumbnail: "",
                thumbnailUrl: "",
                title: "",
                category: "2",
                channel: currentOch,
                description: "",
                location: "",
                activityStartDate: "",
                activityStartTime: "",
                topics: [],
                inputTopic: "",
                duration: "60",
                durationType: "Minutes",
                maxSeats: "",
                allowGuests: "1",
                budget: "",
                onlineLink: ""
            }
    
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
let app =  createApp(RootComponent);
app.mixin(new Auth({need_permission : true}));
app.mixin(ImageAdaptiveComponent);
app.mixin(DirectiveComponent);
app.mixin(Pagination);
app.mixin(CodeExplainComponent);

const meetrAppEvents = app.mount('#app');

window.meetrAppEventsPage = meetrAppEvents;

meetrAppEvents.pageInit(meetrAppEvents.feedList_pagination);
meetrAppEvents.fetchChannelGeneralInfoV();

async function doPublishEvent(formData){
    const url="/api/v1/app/meetr/event/new";
    return await axios.post(url,formData);
}
async function doFetchEventInfo(eventId){
    const url="/api/v1/app/meetr/event/{id}/info".replace("{id}",eventId);
    return await axios.get(url);
}
async function doEditEvent(dto){
  const url="/api/v1/app/meetr/event/edit";
  return await axios.put(url,dto);
}
async function doDeleteEvnet(eventId){
  const url="/api/v1/app/meetr/event/{id}/del".replace("{id}",eventId);
  return await axios.delete(url);
}
async function doRegisterEvent(eventId){
  const url="/api/v1/app/meetr/event/{id}/reserve".replace("{id}",eventId);
  return await axios.post(url,{})
}
async function doChangeEventThumbnail(eventId,thumbnail){
  const url="/api/v1/app/meetr/event/thumbnail/change";
  var form = new FormData();
  form.append("eventId",eventId);
  form.append("thumbnail",thumbnail);
  return await axios.put(url,form);
}
async function changeEventThumbnail(eventId,thumbnail){
  return await doChangeEventThumbnail(eventId,thumbnail);
}
async function registerEvent(eventId){
  return await doRegisterEvent(eventId);
}
async function deleteOneEvent(eventId){
  return await doDeleteEvnet(eventId);
}
async function editEvent(eventProfile){
  const activityStartAt = `${eventProfile.activityStartDate} ${eventProfile.activityStartTime}:00`;

   const dto = {
     id: eventProfile.id,
     title: eventProfile.title,
     category: eventProfile.category,
     eventType: eventProfile.eventType,
     eventStatus: eventProfile.eventStatus,
     description: eventProfile.description,
     location: eventProfile.location,
     onlineLink: eventProfile.onlineLink,
     activityStartAt: activityStartAt,
     duration: eventProfile.duration,
     durationType: eventProfile.durationType,
     maxSeats: eventProfile.maxSeats,
     allowGuests: eventProfile.allowGuests,
     budget: eventProfile.budget,
     topics:  eventProfile.topics
  }  
   return await doEditEvent(dto);
  
}
async function publishEvent(eventProfile){
  const activityStartAt = `${eventProfile.activityStartDate} ${eventProfile.activityStartTime}:00`;

  var form = new FormData();
  form.append("eventType",eventProfile.eventType);
  form.append("thumbnail",eventProfile.thumbnail);
  form.append("title",eventProfile.title);
  form.append("category",eventProfile.category);
  form.append("channel",eventProfile.channel);
  form.append("description",eventProfile.description);
  form.append("location",eventProfile.location);
  form.append("activityStartAt",activityStartAt);
  form.append("topics",eventProfile.topics.join(','));
  form.append("duration",eventProfile.duration);
  form.append("durationType",eventProfile.durationType);
  form.append("maxSeats",eventProfile.maxSeats);
  form.append("allowGuests",eventProfile.allowGuests);
  form.append("budget",eventProfile.budget);
  form.append("onlineLink",eventProfile.onlineLink);
   return await doPublishEvent(form);
}


async function findEventProfile(eventId){
   return await doFetchEventInfo(eventId);
}


function showMore(){
    if(meetrAppEvents.feedList_pagination.isLoading){
        return;
    }
    meetrAppEvents.feedList_pagination.current = meetrAppEvents.feedList_pagination.current +  1;
    meetrAppEvents.feedList_pagination.isLoading = true;

    meetrAppEvents.reloadPage(meetrAppEvents.feedList_pagination);

}




// Enable popovers 

const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl))

$(function(){
	$(".tooltip-nav").tooltip();
});




function previewNewEventThumbnail(e, appObj) {

  const file = e.target.files[0];
  if (!file) {
    return;
  }

  const URL2 = URL.createObjectURL(file);

  // validate image size <=6M
  var size = parseFloat(file.size);
  var maxSizeMB = 6; //Size in MB.
  var maxSize = maxSizeMB * 1024 * 1024; //File size is returned in Bytes.
  if (size > maxSize) {
    customAlert.alert("图片最大为6M!");
    document.querySelector('#coverInput').value = ''; // reset file input
    return false;
  }

  const feedThumbnailImgFile = new Image();
  feedThumbnailImgFile.onload = () => {

    // validate image pixel
    if (!(feedThumbnailImgFile.width >= 99 && feedThumbnailImgFile.height >= 99 && feedThumbnailImgFile.width < 4096 && feedThumbnailImgFile.height < 4096 && feedThumbnailImgFile.width * feedThumbnailImgFile.height < 9437184)) {
      customAlert.alert("图片必须至少为 99 x 99 像素,单边长度不能超过4096像素,且总像素不能超过9437184!");
      document.querySelector('#coverInput').value = ''; // reset file input
      return false;
    }

    appObj.newEventObj.thumbnail = file;

    appObj.newEventObj.thumbnailUrl = URL2;


  };

  feedThumbnailImgFile.src = URL.createObjectURL(file);

}

function previewEditEventThumbnail(e,appObj){

  const file = e.target.files[0];
  if (!file) {
    return;
  }


  const URL2 = URL.createObjectURL(file);

  // validate image size <=6M
  var size = parseFloat(file.size);
  var maxSizeMB = 6; //Size in MB.
  var maxSize = maxSizeMB * 1024 * 1024; //File size is returned in Bytes.
  if (size > maxSize) {
    customAlert.alert("图片最大为6M!");
    document.querySelector('#editCoverInput').value = ''; // reset file input
    return false;
  }

  const feedThumbnailImgFile = new Image();
  feedThumbnailImgFile.onload = () => {

    // validate image pixel
    if (!(feedThumbnailImgFile.width >= 99 && feedThumbnailImgFile.height >= 99 && feedThumbnailImgFile.width < 4096 && feedThumbnailImgFile.height < 4096 && feedThumbnailImgFile.width * feedThumbnailImgFile.height < 9437184)) {
      customAlert.alert("图片必须至少为 99 x 99 像素,单边长度不能超过4096像素,且总像素不能超过9437184!");
      document.querySelector('#editCoverInput').value = ''; // reset file input
      return false;
    }

    // appObj.editEventObj.thumbnail = file;

    changeEventThumbnail(appObj.editEventObj.id,file).then(response=>{
      if(response.data.code == 200){
           
        appObj.editEventObj.thumbnailUrl = URL2;
        appObj.eventInfo.thumbnail= URL2; // 更新主图显示

      }
 
      if(response.data.code!=200){
          const error="操作失败，请检查网络、查阅异常信息或联系技术支持。异常信息："+response.data.message;
          customAlert.alert(error); 
      }

    });




  };

  feedThumbnailImgFile.src = URL.createObjectURL(file);
}